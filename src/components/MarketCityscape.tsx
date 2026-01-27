'use client'

import React, { useMemo, useRef, useState, useLayoutEffect } from 'react'
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { treemap, hierarchy, TreemapLayout } from 'd3-hierarchy'

// --- Types ---
export type StockNode = {
    name: string
    ticker: string
    value: number // Market Cap
    performance: number // % Change
    pe_ratio: number // Y-Axis
    children?: StockNode[]
}

type MarketCityscapeProps = {
    data: StockNode
}

// --- Constants ---
const BOX_SIZE = 0.9 // Gap between blocks
const MAX_HEIGHT = 20 // Max height for P/E

// --- Component ---
function CityscapeMesh({ data }: { data: StockNode }) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const [hoveredInstance, setHovered] = useState<number | null>(null)

    // 1. Calculate Layout
    const leaves = useMemo(() => {
        const root = hierarchy(data)
            .sum((d) => d.value)
            .sort((a, b) => (b.value || 0) - (a.value || 0))

        // Use d3 treemap to calculate x/y coordinates
        // We map 0-100 coordinate space
        const layout = treemap<StockNode>()
            .size([100, 100])
            .padding(0.1)
            .round(true)(root)

        return layout.leaves()
    }, [data])

    // 2. Update Instances (Imperative for Perf)
    useLayoutEffect(() => {
        if (!meshRef.current) return

        const tempObject = new THREE.Object3D()
        const color = new THREE.Color()

        leaves.forEach((node, i) => {
            const { x0, x1, y0, y1 } = node as any
            const width = x1 - x0
            const depth = y1 - y0

            // Calculate Height based on P/E Ratio
            // Clamp P/E between 0 and 100 for safety, map to 0-MAX_HEIGHT
            const pe = node.data.pe_ratio || 0
            const height = THREE.MathUtils.mapLinear(Math.min(Math.max(pe, 5), 60), 5, 60, 1, MAX_HEIGHT)

            // Position: Centered on the block
            // D3 gives top-left (y0) to bottom-right (y1). 
            // In 3D: X is width, Z is depth.
            // D3 Y -> 3D Z.
            tempObject.position.set(
                x0 + width / 2 - 50, // Center map at 0,0
                height / 2,
                y0 + depth / 2 - 50
            )

            tempObject.scale.set(width * BOX_SIZE, height, depth * BOX_SIZE)
            tempObject.updateMatrix()
            meshRef.current?.setMatrixAt(i, tempObject.matrix)

            // Color based on Performance
            // Green = positive, Red = negative. Intensity = magnitude.
            const perf = node.data.performance || 0
            if (perf >= 0) {
                // Green
                color.setHSL(0.3, 1, Math.min(0.2 + perf * 10, 0.8)) // Brighter with more gain
            } else {
                // Red
                color.setHSL(0.0, 1, Math.min(0.2 + Math.abs(perf) * 10, 0.8))
            }
            meshRef.current?.setColorAt(i, color)
        })

        meshRef.current.instanceMatrix.needsUpdate = true
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
    }, [leaves])

    // 3. Interaction
    const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        if (e.instanceId !== undefined) {
            setHovered(e.instanceId)
        }
    }

    const handlePointerOut = () => {
        setHovered(null)
    }

    return (
        <group>
            <instancedMesh
                ref={meshRef}
                args={[undefined, undefined, leaves.length]}
                onPointerMove={handlePointerMove}
                onPointerOut={handlePointerOut}
            >
                <boxGeometry />
                <meshStandardMaterial metalness={0.5} roughness={0.4} />
            </instancedMesh>

            {/* Basic Tooltip / Highlight Overlay */}
            {hoveredInstance !== null && (
                <HoverHighlight
                    index={hoveredInstance}
                    node={leaves[hoveredInstance]}
                    meshRef={meshRef}
                />
            )}
        </group>
    )
}

function HoverHighlight({ index, node, meshRef }: { index: number, node: any, meshRef: React.RefObject<THREE.InstancedMesh | null> }) {
    // Get position of the active instance
    const matrix = new THREE.Matrix4()
    meshRef.current?.getMatrixAt(index, matrix)
    const position = new THREE.Vector3().setFromMatrixPosition(matrix)
    const scale = new THREE.Vector3().setFromMatrixScale(matrix)

    return (
        <group position={[position.x, position.y + scale.y / 2 + 1, position.z]}>
            <Billboard>
                <Text
                    fontSize={2}
                    color="white"
                    anchorX="center"
                    anchorY="bottom"
                    outlineWidth={0.1}
                    outlineColor="black"
                >
                    {node.data.ticker}
                    {'\n'}
                    {(node.data.performance * 100).toFixed(2)}%
                </Text>
            </Billboard>
        </group>
    )
}

export default function MarketCityscape({ data }: MarketCityscapeProps) {
    return (
        <div className="w-full h-full min-h-[500px] bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            <Canvas camera={{ position: [60, 60, 60], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <directionalLight position={[-10, 20, 5]} intensity={1.5} castShadow />

                <group>
                    <CityscapeMesh data={data} />
                    {/* Ground Plane */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                        <planeGeometry args={[120, 120]} />
                        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
                    </mesh>
                </group>

                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going below ground
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                />
            </Canvas>
        </div>
    )
}
