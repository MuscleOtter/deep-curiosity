import { StockNode, ChartData } from '@/types'

const SECTORS = ['Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy']
const TICKERS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'JPM', 'V', 'LLY']

/**
 * Generates mock data for the 3D/2D Market Map.
 * Structure:
 * - Root: S&P 500
 * - Children: Sectors (Technology, Healthcare, etc.)
 * - Grandchildren: Stocks (Ticker, Value, Performance, P/E)
 */
export function generateMockMapData(): StockNode {
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

/**
 * Generates mock OHLCV data for technical charts.
 * - Simulates random walk price movement.
 * - Returns array of Candles for Lightweight Charts.
 */
export function generateMockChartData(days = 100): ChartData[] {
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

export const WATCHLIST_TICKERS = TICKERS
