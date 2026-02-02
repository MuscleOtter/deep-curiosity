import { useState, useEffect } from 'react'
import { StockNode, ChartData } from '@/types'
import { MarketService } from '@/services/market'

export type MarketType = 'stocks' | 'etfs' | 'commodities'

/**
 * useMarketData Hook
 * 
 * Encapsulated state management for the Dashboard.
 * Handles data fetching, loading states, and error handling.
 */
export function useMarketData() {
    const [marketType, setMarketType] = useState<MarketType>('stocks')
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
                // Determine which map fetcher to use
                let mapPromise
                if (marketType === 'stocks') mapPromise = MarketService.getMarketMap()
                else if (marketType === 'etfs') mapPromise = MarketService.getETFMap()
                else mapPromise = MarketService.getCommoditiesMap()

                // Parallel data fetching
                const [map, spy, qqq, dia, watchlist] = await Promise.all([
                    mapPromise,
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
    }, [marketType])

    return {
        marketType,
        setMarketType,
        mapData,
        chartDataSPY,
        chartDataQQQ,
        chartDataDIA,
        watchlistData,
        isLoading
    }
}
