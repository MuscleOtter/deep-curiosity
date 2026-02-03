'use client'

import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { StockNode } from '@/types'

/**
 * CommodityBubbleChart
 * 
 * specialized visualization for Commodity Traders.
 * - X-Axis: Performance % (Price Action)
 * - Y-Axis: Relative Volume (Liquidity/Interest)
 * - Size: Market Value / Interest
 * - Color: Sector Grouping
 * 
 * Goal: Quickly identify outliers (High Vol + High Move).
 */

const SECTOR_COLORS: Record<string, string> = {
    'Energy': '#ef4444',     // Red
    'Metals': '#eab308',     // Gold/Yellow
    'Agriculture': '#22c55e',// Green
    'Meats/Livestock': '#f97316' // Orange
}

export default function CommodityBubbleChart({ data }: { data: StockNode }) {

    // Flatten hierarchy into scatter data points
    const scatterData = useMemo(() => {
        const points: any[] = []

        if (!data.children) return []

        data.children.forEach(sector => {
            const sectorName = sector.name
            const color = SECTOR_COLORS[sectorName] || '#94a3b8'

            sector.children?.forEach(contract => {
                points.push({
                    name: contract.ticker,
                    value: [
                        contract.performance * 100,     // 0: Perf %
                        contract.relative_volume || 1,  // 1: R.Vol
                        contract.value,                 // 2: Size -> Radius
                        sectorName,                     // 3: Sector
                        contract.performance,           // 4: Raw Perf
                        0,                              // 5: Price Placeholder
                        contract.name                   // 6: Full Name
                    ],
                    itemStyle: {
                        color: color,
                        shadowBlur: 10,
                        shadowColor: color
                    }
                })
            })
        })
        return points
    }, [data])

    const option = {
        backgroundColor: 'transparent',
        grid: {
            top: 40,
            right: 40,
            bottom: 40,
            left: 50,
            containLabel: true
        },
        tooltip: {
            padding: 10,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: '#334155',
            textStyle: { color: '#f1f5f9' },
            formatter: function (obj: any) {
                const value = obj.value;
                const fullName = value[6] || obj.name; // Use Full Name if available
                return `
                    <div style="font-weight:bold; font-size:14px; margin-bottom:4px;">${fullName} <span style="font-weight:normal; color:#94a3b8">(${obj.name})</span></div>
                    <div style="font-size:12px; color:#cbd5e1;">${value[3]}</div>
                    <hr style="border-color:#334155; margin:5px 0;"/>
                    <div>Performance: <span style="color:${value[0] >= 0 ? '#4ade80' : '#f87171'}">${value[0].toFixed(2)}%</span></div>
                    <div>Relative Vol: <span style="color:#60a5fa">${value[1].toFixed(2)}x</span></div>
                `;
            }
        },
        xAxis: {
            name: 'Performance %',
            nameLocation: 'middle',
            nameGap: 30,
            type: 'value',
            splitLine: {
                lineStyle: {
                    type: 'dashed',
                    color: '#334155'
                }
            },
            axisLine: { lineStyle: { color: '#94a3b8' } },
            axisLabel: { formatter: '{value}%' }
        },
        yAxis: {
            name: 'Relative Volume',
            nameLocation: 'middle',
            nameGap: 40,
            type: 'value',
            min: 0, // Vol can't be lowest
            splitLine: {
                lineStyle: {
                    type: 'dashed',
                    color: '#334155'
                }
            },
            axisLine: { lineStyle: { color: '#94a3b8' } },
            axisLabel: { formatter: '{value}x' }
        },
        series: [
            {
                type: 'scatter',
                symbolSize: function (data: any) {
                    // Map value (billions) to radius (10-50px)
                    // Log scale for better distribution
                    const val = data[2] || 1000000000; // Fallback to avoid NaN/Infinity
                    return Math.max(Math.log(val) * 1.5 - 30, 10);
                },
                data: scatterData,
                label: {
                    show: true,
                    formatter: '{b}', // Ticker
                    fontSize: 10,
                    color: '#fff',
                    position: 'top'
                },
                itemStyle: {
                    opacity: 0.8,
                    borderColor: '#fff',
                    borderWidth: 1
                },
                markLine: {
                    lineStyle: {
                        type: 'solid',
                        color: '#475569'
                    },
                    data: [
                        { xAxis: 0, label: { show: false } }, // Zero line for performance
                        { yAxis: 1, type: 'average', lineStyle: { type: 'dashed', color: '#64748b' } } // Avg Volume line
                    ]
                }
            }
        ]
    };

    return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
}
