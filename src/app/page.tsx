'use client'

import React, { useState } from 'react'
import MarketCityscape, { HeightMetric, ColorMetric } from '@/components/charts/MarketCityscape'
import MarketTreemap2D from '@/components/charts/MarketTreemap2D'
import CommodityBubbleChart from '@/components/charts/CommodityBubbleChart'
import TechChart from '@/components/charts/TechChart'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useMarketData } from '@/hooks/useMarketData'

// --- Components ---
/**
 * Dashboard
 * 
 * Main entry point for the Antigravity Terminal.
 * - Layout: Bento Grid (CSS Grid)
 * - State: Delegated to `useMarketData` hook (MVVM pattern).
 * - Components: Orchestrates 3D/2D views and Technical Charts.
 */
export default function Dashboard() {
  const {
    marketType,
    setMarketType,
    mapData,
    chartDataSPY,
    chartDataQQQ,
    chartDataDIA,
    watchlistData,
    isLoading
  } = useMarketData()

  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D')
  const [showSMA, setShowSMA] = useState(true)
  const [heightMetric, setHeightMetric] = useState<HeightMetric>('relative_volume')
  const [colorMetric, setColorMetric] = useState<ColorMetric>('performance')

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 font-sans relative overflow-hidden">
      {/* ... Background Blobs ... */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse" />
      <div className="absolute top-[10%] right-[0%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse delay-1000" />
      <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse delay-2000" />

      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
            DEEP <span className="text-slate-500 font-light">CURIOSITY</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Market Intelligence / v1.1.0</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto justify-between md:justify-end">
          {/* Global Mode Switch */}
          <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-md rounded-lg p-1 border border-white/5 shadow-lg">
            <Button onClick={() => setMarketType('stocks')} variant={marketType === 'stocks' ? 'primary' : 'ghost'} className="px-3 py-1 text-xs">Stocks</Button>
            <Button onClick={() => setMarketType('etfs')} variant={marketType === 'etfs' ? 'primary' : 'ghost'} className="px-3 py-1 text-xs">ETFs</Button>
            <Button onClick={() => setMarketType('commodities')} variant={marketType === 'commodities' ? 'primary' : 'ghost'} className="px-3 py-1 text-xs">Commodities</Button>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-md rounded-lg p-1 border border-white/5 shadow-lg">
            <Button onClick={() => setViewMode('3D')} variant={viewMode === '3D' ? 'primary' : 'ghost'} className="px-3 py-1 text-xs">3D</Button>
            <Button onClick={() => setViewMode('2D')} variant={viewMode === '2D' ? 'primary' : 'ghost'} className="px-3 py-1 text-xs">2D</Button>
          </div>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-[auto_auto] gap-6 max-w-[1920px] mx-auto relative z-10">

        {/* Main Area: 3D Cityscape */}
        <section className="col-span-1 md:col-span-3 h-[60vh] min-h-[400px] md:h-[600px] relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-slate-950/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl -z-10" />

          <div className="h-full w-full p-2 flex flex-col gap-2">
            {/* Control Bar for Cityscape 
                - Height Controls: Toggle between PE, Val, Yield, and Relative Volume.
                - Color Controls: Toggle performance vs fundamental heatmaps.
            */}
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 px-2">
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 bg-black/20 p-2 rounded-lg border border-white/5 overflow-x-auto whitespace-nowrap max-w-full scrollbar-none">
                <span className="uppercase text-slate-500">Height:</span>
                {(['pe', 'pb', 'yield', 'market_cap', 'relative_volume'] as HeightMetric[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setHeightMetric(m)}
                    className={cn(
                      "hover:text-white transition-colors uppercase px-1",
                      heightMetric === m ? "text-blue-400 font-bold" : "text-slate-500"
                    )}
                  >
                    {m === 'pe' ? 'P/E' : m === 'pb' ? 'P/B' : m === 'market_cap' ? 'Val' : m === 'relative_volume' ? 'R.Vol' : 'Div%'}
                  </button>
                ))}
                <div className="w-px h-3 bg-slate-700 mx-2 shrink-0" />
                <span className="uppercase text-slate-500">Color:</span>
                {(['performance', 'yield', 'debt'] as ColorMetric[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setColorMetric(m)}
                    className={cn(
                      "hover:text-white transition-colors uppercase px-1",
                      colorMetric === m ? "text-emerald-400 font-bold" : "text-slate-500"
                    )}
                  >
                    {m === 'performance' ? 'Perf' : m === 'debt' ? 'D/E' : 'Div%'}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-full w-full rounded-2xl overflow-hidden relative border border-white/5 bg-slate-950/50">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">Loading Antigravity Engine...</div>
              ) : mapData ? (
                marketType === 'commodities' ? (
                  <CommodityBubbleChart data={mapData} />
                ) : viewMode === '3D' ? (
                  <MarketCityscape data={mapData} heightMetric={heightMetric} colorMetric={colorMetric} />
                ) : (
                  <MarketTreemap2D data={mapData} />
                )
              ) : null}
            </div>
          </div>
        </section>

        {/* Right Column: News / Intel */}
        <section className="col-span-1 h-auto min-h-[400px] md:h-[600px] flex flex-col gap-6">
          <Card className="flex-1 relative" title={undefined}>
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              Market Intel
            </h3>
            <div className="space-y-4 overflow-y-auto max-h-[220px] pr-2 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="group cursor-pointer mb-3 p-2 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
                  <p className="text-[10px] text-slate-500 mb-1 font-mono uppercase tracking-wider">2 mins ago • AI Summary</p>
                  <h4 className="text-sm font-medium text-slate-300 group-hover:text-blue-300 transition-colors leading-snug">
                    Tech sector sees rotation into semi-conductors as NVDA breaks key resistance levels.
                  </h4>
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex-1" title="Watchlist">
            <div className="space-y-1 overflow-y-auto max-h-[220px] pr-2 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent">
              {watchlistData.map((t) => (
                <div key={t.ticker} className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5 group">
                  <span className="font-mono font-bold text-slate-300 group-hover:text-white">{t.ticker}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">USD</span>
                    <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs">+{t.change.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Bottom Row: Technical Charts */}
        <section className="col-span-1 md:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-300">Technical Analysis</h3>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <input
                type="checkbox"
                checked={showSMA}
                onChange={(e) => setShowSMA(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0 cursor-pointer"
              />
              <span>Show Indicators (SMA)</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TechChart ticker="SPY" data={chartDataSPY} showIndicators={showSMA} />
            <TechChart ticker="QQQ" data={chartDataQQQ} showIndicators={showSMA} />
            <TechChart ticker="DIA" data={chartDataDIA} showIndicators={showSMA} />
          </div>
        </section>

      </div>
    </main>
  )
}
