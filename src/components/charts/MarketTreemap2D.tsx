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
        fullName: node.name, // Pass full name for tooltip
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
    // Finviz Style: Solid, high-contrast colors
    const intensity = Math.min(Math.abs(perf) * 20, 1) // Cap at 5% move

    if (isPositive) {
        // Green: from faint #dcfce7 to vibrant #16a34a
        // Use HSL for cleaner interpolation
        // Light Green: Terminals often use #006000 for background text, but for blocks:
        // Finviz Green: #146200 (Deep) to #49ff00 (Bright)
        // Let's use Tailwind Emerald:
        if (perf > 0.03) return '#16a34a' // Bright Green (>3%)
        if (perf > 0.01) return '#22c55e' // Medium Green (>1%)
        return '#4ade80' // Light Green (0-1%)
    } else {
        // Finviz Red: #600000 (Deep) to #ff1a1a (Bright)
        if (perf < -0.03) return '#dc2626' // Deep Red (<-3%)
        if (perf < -0.01) return '#ef4444' // Med Red (<-1%)
        return '#f87171' // Light Red (0 to -1%)
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
                const fullName = info.data.fullName || info.name;

                return [
                    `<div class="font-bold border-b border-slate-600 pb-1 mb-1">${fullName} <span class="text-slate-400 font-medium text-xs">(${info.name})</span></div>`,
                    `Market Cap: <span class="text-slate-300">$${marketCap}</span>`,
                    `Performance: <span class="${value[1] >= 0 ? 'text-green-400' : 'text-red-400'}">${perf}</span>`,
                    `P/E Ratio: <span class="text-slate-300">${pe}</span>`
                ].join('<br/>');
            },
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: '#334155',
            textStyle: { color: '#f1f5f9' },
            padding: 12
        },
        series: [
            {
                type: 'treemap',
                visualDimension: 0, // Use index 0 (Market Cap) for area size
                visibleMin: 300,
                roam: false, // Map view should be static typically
                label: {
                    show: true,
                    formatter: function (info: any) {
                        const value = info.value;
                        if (Array.isArray(value) && value.length >= 2) {
                            const perf = (value[1] * 100).toFixed(2) + '%';
                            return `{bold|${info.name}}\n{val|${perf}}`;
                        }
                        return info.name;
                    },
                    rich: {
                        bold: {
                            fontWeight: '900',
                            fontSize: 18, // Larger
                            color: '#fff',
                            textShadowColor: 'rgba(0,0,0,0.5)',
                            textShadowBlur: 3,
                            lineHeight: 24
                        },
                        val: {
                            fontSize: 12,
                            color: '#f1f5f9',
                            textShadowColor: 'rgba(0,0,0,0.5)',
                            textShadowBlur: 2,
                            align: 'center',
                            padding: [2, 0, 0, 0]
                        }
                    }
                },
                itemStyle: {
                    borderColor: '#000',
                    borderWidth: 1,
                    gapWidth: 1
                },
                upperLabel: {
                    show: true,
                    height: 24,
                    color: '#e2e8f0',
                    backgroundColor: '#1e293b',
                    fontWeight: 'bold',
                    fontSize: 11
                },
                levels: [
                    {
                        itemStyle: {
                            borderColor: '#000',
                            borderWidth: 2,
                            gapWidth: 2
                        },
                        upperLabel: { show: false }
                    },
                    {
                        itemStyle: {
                            borderColor: '#111',
                            borderWidth: 1,
                            gapWidth: 1
                        },
                        upperLabel: {
                            show: true,
                            backgroundColor: '#0f172a', // Dark header for Sector
                            color: '#94a3b8',
                            fontWeight: 'bold',
                            fontSize: 12,
                            padding: [0, 4]
                        }
                    }
                ],
                data: [chartData]
            }
        ]
    };

    return <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        onEvents={{
            click: (e: any) => { console.log('Treemap clicked', e.name) }
        }}
    />
}
