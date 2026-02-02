'use client'

import React from 'react'
import ReactECharts from 'echarts-for-react'
import { StockNode } from '@/types'

/**
 * MarketTreemap2D
 * 
 * Standard 2D Treemap visualization using ECharts.
 * - Size: Market Cap
 * - Color: Performance
 */

// Transform raw hierarchy to ECharts format
function transformData(node: StockNode): any {
    const isLeaf = !node.children || node.children.length === 0
    return {
        name: isLeaf ? node.ticker : (node.name || node.ticker),
        value: [node.value, node.performance, node.pe_ratio], // Value array for dimensions
        itemStyle: {
            color: node.children ? undefined : (node.performance >= 0
                ? calculateColor(node.performance, true)
                : calculateColor(node.performance, false))
        },
        children: node.children ? node.children.map(transformData) : undefined
    }
}

function calculateColor(perf: number, isPositive: boolean) {
    // Simple gradient logic matching 3D view
    // Green: #22c55e (Tailwind Green 500)
    // Red: #ef4444 (Tailwind Red 500)
    const intensity = Math.min(0.2 + Math.abs(perf) * 10, 0.9)
    if (isPositive) {
        return `rgba(34, 197, 94, ${intensity})`
    } else {
        return `rgba(239, 68, 68, ${intensity})`
    }
}

export default function MarketTreemap2D({ data }: { data: StockNode }) {
    const chartData = transformData(data)

    const option = {
        tooltip: {
            formatter: function (info: any) {
                const value = info.value;
                const isArray = Array.isArray(value) && value.length >= 3;

                if (!isArray) {
                    return `<div class="font-bold">${info.name}</div>`;
                }

                const marketCap = (value[0] / 1e9).toFixed(1) + 'B';
                const perf = (value[1] * 100).toFixed(2) + '%';
                const pe = value[2].toFixed(1);

                return [
                    `<div class="font-bold">${info.name}</div>`,
                    `Market Cap: $${marketCap}`,
                    `Performance: ${perf}`,
                    `P/E Ratio: ${pe}`
                ].join('<br/>');
            }
        },
        series: [
            {
                type: 'treemap',
                visibleMin: 300,
                label: {
                    show: true,
                    formatter: function (info: any) {
                        const value = info.value;
                        if (Array.isArray(value) && value.length >= 2) {
                            const perf = (value[1] * 100).toFixed(2) + '%';
                            return `{bold|${info.name}}\n${perf}`;
                        }
                        return info.name;
                    },
                    rich: {
                        bold: {
                            fontWeight: 'bold',
                            fontSize: 14,
                            lineHeight: 20
                        }
                    }
                },
                itemStyle: {
                    borderColor: '#1e293b',
                    borderWidth: 1,
                    gapWidth: 1
                },
                upperLabel: {
                    show: true,
                    height: 30,
                    color: '#cbd5e1',
                    backgroundColor: 'transparent'
                },
                levels: [
                    {
                        itemStyle: {
                            borderColor: '#0f172a',
                            borderWidth: 4,
                            gapWidth: 4
                        }
                    },
                    {
                        colorSaturation: [0.3, 0.6],
                        itemStyle: {
                            borderColorSaturation: 0.7,
                            gapWidth: 2,
                            borderWidth: 2
                        }
                    }
                ],
                data: [chartData]
            }
        ]
    };

    return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
}
