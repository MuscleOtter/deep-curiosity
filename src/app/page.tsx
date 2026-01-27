'use client'

import React, { useState, useEffect } from 'react'
import MarketCityscape, { StockNode } from '@/components/MarketCityscape'
import MarketTreemap2D from '@/components/MarketTreemap2D'
import TechChart, { ChartData } from '@/components/TechChart'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Mock Data Generators ---
const SECTORS = ['Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy']
const TICKERS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'JPM', 'V', 'LLY']

function generateMockMapData(): StockNode {
  return {
    name: 'S&P 500',
    ticker: 'SPX',
    value: 10000000000000,
    performance: 0,
    pe_ratio: 0,
    children: SECTORS.map((sector) => ({
      name: sector,
      ticker: sector.toUpperCase(),
      value: Math.random() * 2000000000000 + 500000000000,
      performance: (Math.random() - 0.5) * 0.05,
      pe_ratio: 0,
      children: Array.from({ length: 15 }).map((_, i) => ({
        name: `Stock ${i}`,
        ticker: TICKERS[i % TICKERS.length] || `STK${i}`,
        value: Math.random() * 500000000000 + 10000000000,
        performance: (Math.random() - 0.5) * 0.08, // -4% to +4%
        pe_ratio: Math.random() * 50 + 5, // 5 to 55 P/E
      })),
    })),
  }
}

function generateMockChartData(days = 100): ChartData[] {
  let price = 150
  const data: ChartData[] = []
  const now = new Date()

  for (let i = 0; i < days; i++) {
    const time = new Date(now)
    time.setDate(time.getDate() - (days - i))
    const timeStr = time.toISOString().split('T')[0]

    const volatility = 2
    const change = (Math.random() - 0.5) * volatility
    const open = price
    const close = price + change
    const high = Math.max(open, close) + Math.random() * 1
    const low = Math.min(open, close) - Math.random() * 1
    const volume = Math.floor(Math.random() * 1000000) + 500000

    data.push({ time: timeStr, open, high, low, close, volume })
    price = close
  }
  return data
}

// --- Components ---
export default function Dashboard() {
  const [mapData, setMapData] = useState<StockNode | null>(null)
  const [chartDataSPY, setChartDataSPY] = useState<ChartData[]>([])
  const [chartDataQQQ, setChartDataQQQ] = useState<ChartData[]>([])
  const [chartDataDIA, setChartDataDIA] = useState<ChartData[]>([])
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D')

  // Hydrate Data
  useEffect(() => {
    setMapData(generateMockMapData())
    setChartDataSPY(generateMockChartData(200))
    setChartDataQQQ(generateMockChartData(200))
    setChartDataDIA(generateMockChartData(200))
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 font-sans">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            ANTIGRAVITY <span className="text-slate-500 font-light">TERMINAL</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Market Situational Awareness / v1.0.0</p>
        </div>
        <div className="flex gap-6 items-center w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button
              onClick={() => setViewMode('3D')}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-all",
                viewMode === '3D' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              )}
            >
              3D Immersive
            </button>
            <button
              onClick={() => setViewMode('2D')}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-all",
                viewMode === '2D' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              )}
            >
              2D Standard
            </button>
          </div>

          <div className="flex gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500 uppercase tracking-wider">S&P 500</p>
              <p className="text-emerald-400 font-mono font-bold">4,120.50 <span className="bg-emerald-500/10 px-1 rounded">+1.2%</span></p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Market Status</p>
              <p className="text-emerald-400 font-mono font-bold animate-pulse">OPEN</p>
            </div>
          </div>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-[auto_auto] gap-6 max-w-[1920px] mx-auto">

        {/* Main Area: 3D Cityscape (Span 3 Cols, 2 Rows worth of height equivalent?) */}
        {/* Actually Blueprint says: "Main Area (2x2)" implies a square-ish aspect. 
            Let's make it span 3 columns and be tall. */}
        <section className="col-span-1 md:col-span-3 h-[600px] relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-md rounded-2xl border border-slate-800/50 -z-10" />

          <div className="h-full w-full p-1">
            <div className="h-full w-full rounded-xl overflow-hidden relative">
              <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-white shadow-lg pointer-events-none">
                {viewMode === '3D' ? 'Map Mode: P/E Ratio (Height) x Performance (Color)' : 'Map Mode: Size (Market Cap) x Performance (Color)'}
              </div>
              {mapData ? (
                viewMode === '3D' ? (
                  <MarketCityscape data={mapData} />
                ) : (
                  <MarketTreemap2D data={mapData} />
                )
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">Loading Antigravity Engine...</div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: News / Intel (Span 1 Col) */}
        <section className="col-span-1 h-[600px] flex flex-col gap-4">
          {/* Intel Card */}
          <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-4 overflow-hidden shadow-lg relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Market Intel
            </h3>
            <div className="space-y-4 overflow-y-auto max-h-[220px] pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="group cursor-pointer mb-3">
                  <p className="text-xs text-slate-500 mb-1">2 mins ago • AI Summary</p>
                  <h4 className="text-sm font-medium text-slate-300 group-hover:text-blue-400 transition-colors">
                    Tech sector sees rotation into semi-conductors as NVDA breaks key resistance.
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* Watchlist Card */}
          <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-4 shadow-lg overflow-hidden">
            <h3 className="text-lg font-bold text-slate-200 mb-4">Watchlist</h3>
            <div className="space-y-2 overflow-y-auto max-h-[220px] pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              {TICKERS.slice(0, 10).map((t) => (
                <div key={t} className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                  <span className="font-mono font-bold text-slate-300">{t}</span>
                  <span className="font-mono text-emerald-400">+{(Math.random() * 2).toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Row: Technical Charts (Span 4 Cols, Grid of 3) */}
        <section className="col-span-1 md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <TechChart ticker="SPY" data={chartDataSPY} />
          <TechChart ticker="QQQ" data={chartDataQQQ} />
          <TechChart ticker="DIA" data={chartDataDIA} />
        </section>

      </div>
    </main>
  )
}
