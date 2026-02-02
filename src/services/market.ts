import { StockNode, ChartData } from '@/types'
import { generateMockMapData, generateMockChartData, WATCHLIST_TICKERS } from '@/lib/mock-data'

/**
 * MarketService
 * 
 * Abstraction layer for data fetching.
 * Currently uses mock data, but designed to easily swap for real API calls
 * (e.g. Supabase Edge Functions or Massive.com API) without changing UI code.
 */
export const MarketService = {
    /**
     * Fetches the hierarchical market map data (S&P 500 -> Sectors -> Stocks).
     */
    getMarketMap: async (): Promise<StockNode> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))
        return generateMockMapData()
    },

    /**
     * Fetches technical chart data (OHLCV) for a given ticker.
     */
    getChartData: async (ticker: string, days = 200): Promise<ChartData[]> => {
        await new Promise(resolve => setTimeout(resolve, 300))
        return generateMockChartData(days)
    },

    /**
     * Fetches the user's watchlist with current performance data.
     */
    getWatchlist: async (): Promise<{ ticker: string; change: number }[]> => {
        await new Promise(resolve => setTimeout(resolve, 400))
        return WATCHLIST_TICKERS.slice(0, 10).map((t) => ({
            ticker: t,
            change: Math.random() * 2,
        }))
    }
}
