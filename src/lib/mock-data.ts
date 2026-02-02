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
                pb_ratio: Math.random() * 10 + 0.5, // 0.5 to 10.5 P/B
                dividend_yield: Math.random() * 0.08, // 0% to 8% Yield
                debt_to_equity: Math.random() * 3, // 0 to 3 D/E Ratio
                relative_volume: Math.random() * 4 + 0.5, // 0.5x to 4.5x Volume
            })),
        })),
    }
}

/**
 * Generates mock ETF data.
 * Structure:
 * - Root: Global ETFs
 * - Children: Asset Class (Equities, Fixed Income, Commodities)
 * - Grandchildren: Category (US Large Cap, Emerging Markets, Gov Bonds)
 */
export function generateMockETFData(): StockNode {
    const ASSET_CLASSES = ['Equity', 'Fixed Income', 'Commodity', 'Real Estate']
    const ETF_TICKERS = ['SPY', 'QQQ', 'IWM', 'EEM', 'AGG', 'TLT', 'GLD', 'VNQ']

    return {
        name: 'Global Universe',
        ticker: 'ALL',
        value: 5000000000000,
        performance: 0,
        pe_ratio: 0,
        children: ASSET_CLASSES.map((ac) => ({
            name: ac,
            ticker: ac.substring(0, 3).toUpperCase(),
            value: Math.random() * 1000000000000 + 100000000000,
            performance: (Math.random() - 0.5) * 0.03,
            pe_ratio: 0,
            children: Array.from({ length: 8 }).map((_, i) => ({
                name: `ETF ${i}`,
                ticker: ETF_TICKERS[i % ETF_TICKERS.length] + (i > 7 ? i : ''),
                value: Math.random() * 200000000000 + 5000000000,
                performance: (Math.random() - 0.5) * 0.06,
                pe_ratio: Math.random() * 30 + 10,
                pb_ratio: Math.random() * 5 + 1,
                dividend_yield: Math.random() * 0.06,
                debt_to_equity: 0,
                relative_volume: Math.random() * 3 + 0.5,
            }))
        }))
    }
}

/**
 * Generates mock Commodities data.
 * Structure:
 * - Root: Commodities Global Market
 * - Children: Sectors (Energy, Metals, Agriculture, Livestock)
 * - Grandchildren: Futures Contracts (e.g., 'CL' for Crude Oil, 'GC' for Gold)
 * 
 * Note: Includes `relative_volume` to simulate high-activity trading contracts.
 */
export function generateMockCommoditiesData(): StockNode {
    const SECTORS = [
        { name: 'Energy', tickers: ['CL', 'NG', 'RB', 'HO'] },
        { name: 'Metals', tickers: ['GC', 'SI', 'HG', 'PL'] },
        { name: 'Agriculture', tickers: ['ZC', 'ZW', 'ZS', 'KC'] },
        { name: 'Meats/Livestock', tickers: ['LE', 'HE', 'GF'] }
    ]

    return {
        name: 'Commodities',
        ticker: 'CMD',
        value: 2000000000000,
        performance: 0,
        pe_ratio: 0,
        children: SECTORS.map((sector) => ({
            name: sector.name,
            ticker: sector.name.substring(0, 3).toUpperCase(),
            value: Math.random() * 500000000000 + 50000000000,
            performance: (Math.random() - 0.5) * 0.1, // More volatile
            pe_ratio: 0, // N/A for fuzz, but we keep structure
            children: sector.tickers.map((ticker) => ({
                name: ticker,
                ticker: ticker,
                value: Math.random() * 100000000000 + 10000000000,
                performance: (Math.random() - 0.5) * 0.15, // High vol
                pe_ratio: 0,
                relative_volume: Math.random() * 5 + 0.5, // High relative volume common in futures
                dividend_yield: 0,
                debt_to_equity: 0
            }))
        }))
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
