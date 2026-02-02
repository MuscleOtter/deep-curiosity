import { useState, useEffect } from 'react'
import { StockNode, ChartData } from '@/types'
import { MarketService } from '@/services/market'

/**
 * useMarketData Hook
 * 
 * encapsulated state management for the Dashboard.
 * Handles data fetching, loading states, and error handling (future proofing).
 */
export function useMarketData() {
    const [mapData, setMapData] = useState<StockNode | null>(null)
    const [chartDataSPY, setChartDataSPY] = useState<ChartData[]>([])
    const [chartDataQQQ, setChartDataQQQ] = useState<ChartData[]>([])
    const [chartDataDIA, setChartDataDIA] = useState<ChartData[]>([])
    const [watchlistData, setWatchlistData] = useState<{ ticker: string; change: number }[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            try {
                // Parallel data fetching for performance
                const [map, spy, qqq, dia, watchlist] = await Promise.all([
                    MarketService.getMarketMap(),
                    MarketService.getChartData('SPY'),
                    MarketService.getChartData('QQQ'),
                    MarketService.getChartData('DIA'),
                    MarketService.getWatchlist(),
                ])

                setMapData(map)
                setChartDataSPY(spy)
                setChartDataQQQ(qqq)
                setChartDataDIA(dia)
                setWatchlistData(watchlist)
            } catch (error) {
                console.error("Failed to load market data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

    return {
        mapData,
        chartDataSPY,
        chartDataQQQ,
        chartDataDIA,
        watchlistData,
        isLoading
    }
}
