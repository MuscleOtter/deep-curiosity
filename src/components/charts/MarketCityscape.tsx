'use client'

import React, { useMemo, useRef, useState, useLayoutEffect } from 'react'
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { treemap, hierarchy, TreemapLayout } from 'd3-hierarchy'
import { StockNode } from '@/types'

// --- Types ---
/**
 * HeightMetric determines the vertical scale of the blocks.
 * - 'pe', 'pb', 'yield': Fundamental ratios.
 * - 'market_cap': Constant height (since size is already market cap).
 * - 'relative_volume': Activity level (Tall = High Vol).
 */
export type HeightMetric = 'pe' | 'pb' | 'market_cap' | 'yield' | 'relative_volume'
export type ColorMetric = 'performance' | 'yield' | 'debt'

type MarketCityscapeProps = {
    data: StockNode
    heightMetric?: HeightMetric
    colorMetric?: ColorMetric
}

// --- Constants ---
const BOX_SIZE = 0.9
const MAX_HEIGHT = 20

// --- Helpers ---
function getMetricValue(node: any, metric: HeightMetric): number {
    const d = node.data
    switch (metric) {
        case 'pe': return Math.min(Math.max(d.pe_ratio || 0, 5), 60)
        case 'pb': return Math.min(Math.max(d.pb_ratio || 0, 0.5), 10)
        case 'yield': return (d.dividend_yield || 0) * 100
        case 'relative_volume': return Math.min(Math.max(d.relative_volume || 0, 0.5), 10)
        case 'market_cap': return 50
        default: return 10
    }
}

function getMetricRange(metric: HeightMetric): [number, number] {
    switch (metric) {
        case 'pe': return [5, 60]
        case 'pb': return [0.5, 10]
        case 'yield': return [0, 8]
        case 'relative_volume': return [0.5, 5]
        case 'market_cap': return [0, 100]
        default: return [0, 100]
    }
}

/**
 * CityscapeMesh
 */
function CityscapeMesh({ leaves, heightMetric = 'pe', colorMetric = 'performance' }: { leaves: any[], heightMetric: HeightMetric, colorMetric: ColorMetric }) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const [hoveredInstance, setHovered] = useState<number | null>(null)

    // 2. Update Instances
    useLayoutEffect(() => {
        if (!meshRef.current) return

        const tempObject = new THREE.Object3D()
        const color = new THREE.Color()

        leaves.forEach((node, i) => {
            const { x0, x1, y0, y1 } = node as any
            const width = x1 - x0
            const depth = y1 - y0

            // Dynamic Height
            const rawVal = getMetricValue(node, heightMetric)
            const [min, max] = getMetricRange(heightMetric)
            const height = heightMetric === 'market_cap'
                ? THREE.MathUtils.mapLinear(node.value || 0, 1e9, 2e12, 2, MAX_HEIGHT) // Rough map for cap
                : THREE.MathUtils.mapLinear(rawVal, min, max, 1, MAX_HEIGHT)

            tempObject.position.set(
                x0 + width / 2 - 50,
                height / 2,
                y0 + depth / 2 - 50
            )

            tempObject.scale.set(width * BOX_SIZE, height, depth * BOX_SIZE)
            tempObject.updateMatrix()
            meshRef.current?.setMatrixAt(i, tempObject.matrix)

            // Dynamic Color
            const d = node.data
            if (colorMetric === 'performance') {
                const perf = d.performance || 0
                if (perf >= 0) {
                    // Finviz Green Logic
                    if (perf > 0.03) color.set('#16a34a') // Bright Green
                    else if (perf > 0.01) color.set('#22c55e') // Medium
                    else color.set('#4ade80') // Light
                } else {
                    // Finviz Red Logic
                    if (perf < -0.03) color.set('#dc2626') // Deep Red
                    else if (perf < -0.01) color.set('#ef4444') // Medium
                    else color.set('#f87171') // Light
                }
            } else if (colorMetric === 'yield') {
                const yld = d.dividend_yield || 0
                // Teal/Green for yield
                color.setHSL(0.5, 1, Math.min(0.1 + yld * 10, 0.9))
            } else if (colorMetric === 'debt') {
                const debt = d.debt_to_equity || 0
                // Blue (Low Debt) -> Red (High Debt)
                const hue = THREE.MathUtils.lerp(0.6, 0.0, Math.min(debt / 3, 1))
                color.setHSL(hue, 0.8, 0.5)
            }

            meshRef.current?.setColorAt(i, color)
        })

        meshRef.current.instanceMatrix.needsUpdate = true
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
    }, [leaves, heightMetric, colorMetric])

    // ... Interaction handlers ...
    const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        if (e.instanceId !== undefined) setHovered(e.instanceId)
    }
    const handlePointerOut = () => setHovered(null)

    return (
        <group>
            <instancedMesh
                ref={meshRef}
                args={[undefined, undefined, leaves.length]}
                onPointerMove={handlePointerMove}
                onPointerOut={handlePointerOut}
            >
                <boxGeometry />
                <meshStandardMaterial metalness={0.1} roughness={0.9} />
            </instancedMesh>

            {hoveredInstance !== null && (
                <HoverHighlight
                    index={hoveredInstance}
                    node={leaves[hoveredInstance]}
                    meshRef={meshRef}
                    metrics={{ height: heightMetric, color: colorMetric }}
                />
            )}
        </group>
    )
}

/**
 * CityscapeLabels
 * 
 * Renders text labels on top of the 3D blocks ("roofs").
 * - Filters out small blocks to prevent clutter.
 * - Rotates text -90deg (flat) to match the "map" aesthetic.
 * - Dynamically adjusts font size based on block boundaries.
 */
function CityscapeLabels({ leaves, heightMetric }: { leaves: any[], heightMetric: HeightMetric }) {
    return (
        <group>
            {leaves.map((node, i) => {
                const { x0, x1, y0, y1 } = node as any
                const width = x1 - x0
                const depth = y1 - y0

                // Only show labels for larger blocks
                if (width < 3 || depth < 3) return null

                // Recalculate height for positioning
                const rawVal = getMetricValue(node, heightMetric)
                const [min, max] = getMetricRange(heightMetric)
                const height = heightMetric === 'market_cap'
                    ? THREE.MathUtils.mapLinear(node.value || 0, 1e9, 2e12, 2, MAX_HEIGHT)
                    : THREE.MathUtils.mapLinear(rawVal, min, max, 1, MAX_HEIGHT)

                const x = x0 + width / 2 - 50
                const z = y0 + depth / 2 - 50
                const y = height + 0.1 // Sit on top

                const fontSize = Math.min(width, depth) / 3.5

                return (
                    <Text
                        key={i}
                        position={[x, y, z]}
                        rotation={[-Math.PI / 2, 0, 0]} // Flat on top
                        fontSize={fontSize}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.02}
                        outlineColor="black"
                        material-toneMapped={false} // Brighter text
                    >
                        {node.data.ticker}
                    </Text>
                )
            })}
        </group>
    )
}

function HoverHighlight({ index, node, meshRef, metrics }: { index: number, node: any, meshRef: React.RefObject<THREE.InstancedMesh | null>, metrics: { height: HeightMetric, color: ColorMetric } }) {
    // ... setup
    const matrix = new THREE.Matrix4()
    meshRef.current?.getMatrixAt(index, matrix)
    const position = new THREE.Vector3().setFromMatrixPosition(matrix)
    const scale = new THREE.Vector3().setFromMatrixScale(matrix)

    // Dynamic Label
    let valueText = ''
    if (metrics.color === 'performance') valueText = `${(node.data.performance * 100).toFixed(2)}%`
    else if (metrics.color === 'yield') valueText = `Div: ${(node.data.dividend_yield * 100).toFixed(2)}%`
    else if (metrics.color === 'debt') valueText = `D/E: ${node.data.debt_to_equity?.toFixed(2)}`

    let heightText = ''
    if (metrics.height === 'pe') heightText = `P/E: ${node.data.pe_ratio?.toFixed(1)}`
    else if (metrics.height === 'pb') heightText = `P/B: ${node.data.pb_ratio?.toFixed(1)}`
    else if (metrics.height === 'relative_volume') heightText = `RVol: ${node.data.relative_volume?.toFixed(2)}x`

    return (
        <group position={[position.x, position.y + scale.y / 2 + 1, position.z]}>
            <Billboard>
                <Text fontSize={2} color="white" anchorX="center" anchorY="bottom" outlineWidth={0.1} outlineColor="black">
                    {node.data.ticker}
                    {'\n'}
                    {valueText}
                    {'\n'}
                    {heightText}
                </Text>
            </Billboard>
        </group>
    )
}

export default function MarketCityscape({ data, heightMetric = 'pe', colorMetric = 'performance' }: MarketCityscapeProps) {
    // 1. Calculate Layout (Lifted Up)
    const leaves = useMemo(() => {
        const root = hierarchy(data)
            .sum((d) => d.value)
            .sort((a, b) => (b.value || 0) - (a.value || 0))

        const layout = treemap<StockNode>()
            .size([100, 100])
            .padding(0.3) // Thicker gaps to simulate borders
            .round(true)(root)

        return layout.leaves()
    }, [data])

    return (
        <div className="w-full h-full min-h-[500px] bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            <Canvas camera={{ position: [60, 60, 60], fov: 45 }}>
                <ambientLight intensity={1.2} /> {/* Flatter, bright light */}
                <pointLight position={[10, 10, 10]} intensity={0.5} />
                <directionalLight position={[-10, 20, 5]} intensity={1.0} castShadow />

                <group>
                    <CityscapeMesh leaves={leaves} heightMetric={heightMetric} colorMetric={colorMetric} />
                    <CityscapeLabels leaves={leaves} heightMetric={heightMetric} />

                    {/* Ground Plane - Pure Black for "Border" effect */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                        <planeGeometry args={[150, 150]} />
                        <meshStandardMaterial color="#000000" metalness={0.0} roughness={1.0} />
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
