'use client'

import React, { useEffect, useRef } from 'react'
import { createChart, ColorType, IChartApi, Time } from 'lightweight-charts'

// --- Types ---
export type ChartData = {
    time: string // '2023-10-25'
    open: number
    high: number
    low: number
    close: number
    volume: number
}

type TechChartProps = {
    ticker: string
    data: ChartData[]
}

// --- Helpers ---
function calculateSMA(data: ChartData[], count: number) {
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    const result = []
    for (let i = count - 1; i < data.length; i++) {
        const val = avg(data.slice(i - count + 1, i + 1).map((d) => d.close))
        result.push({ time: data[i].time, value: val })
    }
    return result
}

// --- Component ---
export default function TechChart({ ticker, data }: TechChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)

    useEffect(() => {
        if (!chartContainerRef.current || data.length === 0) return

        // 1. Initialize Chart
        const chart: any = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8', // Slate-400
            },
            grid: {
                vertLines: { color: '#1e293b' }, // Slate-800
                horzLines: { color: '#1e293b' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400, // Fixed height or responsive
            timeScale: {
                borderColor: '#334155',
            },
            rightPriceScale: {
                borderColor: '#334155',
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2, // Leave room for volume
                }
            },
        })
        chartRef.current = chart

        // 2. Candlestick Series
        const candleSeries = chart.addCandlestickSeries({
            upColor: '#22c55e', // Green-500
            downColor: '#ef4444', // Red-500
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        })
        candleSeries.setData(
            data.map(({ time, open, high, low, close }) => ({ time: time as Time, open, high, low, close }))
        )

        // 3. Volume Series (Histogram)
        const volumeSeries = chart.addHistogramSeries({
            priceFormat: { type: 'volume' },
            priceScaleId: '', // Overlay on same scale but at bottom
            scaleMargins: {
                top: 0.8, // Push to bottom 20%
                bottom: 0,
            },
        })
        volumeSeries.setData(
            data.map((d) => ({
                time: d.time as Time,
                value: d.volume,
                color: d.close >= d.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
            }))
        )

        // 4. SMA Overlays
        // SMA 20 (Yellow)
        const sma20 = chart.addLineSeries({ color: '#eab308', lineWidth: 1 })
        sma20.setData(calculateSMA(data, 20) as any)

        // SMA 50 (Orange)
        const sma50 = chart.addLineSeries({ color: '#f97316', lineWidth: 1 })
        sma50.setData(calculateSMA(data, 50) as any)

        // SMA 200 (Purple/Blue)
        const sma200 = chart.addLineSeries({ color: '#3b82f6', lineWidth: 2 })
        sma200.setData(calculateSMA(data, 200) as any)

        // 5. Fit & Resize
        chart.timeScale().fitContent()

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth })
            }
        }
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            chart.remove()
        }
    }, [data])

    return (
        <div className="w-full flex flex-col bg-slate-950 rounded-xl border border-slate-800 p-4 shadow-xl">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                    {ticker}
                </h3>
                <div className="flex gap-2 text-xs font-mono text-slate-500">
                    <span className="text-yellow-500">SMA20</span>
                    <span className="text-orange-500">SMA50</span>
                    <span className="text-blue-500">SMA200</span>
                </div>
            </div>
            <div ref={chartContainerRef} className="w-full h-[400px]" />
        </div>
    )
}
