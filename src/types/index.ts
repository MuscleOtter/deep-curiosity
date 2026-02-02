export type StockNode = {
    name: string
    ticker: string
    value: number // Market Cap
    performance: number // % Change
    pe_ratio: number // Y-Axis
    pb_ratio?: number // Price to Book
    dividend_yield?: number // %
    debt_to_equity?: number // Ratio
    relative_volume?: number // 1.0 = Average, 2.0 = 2x Avg
    children?: StockNode[]
}

export type ChartData = {
    time: string // '2023-10-25'
    open: number
    high: number
    low: number
    close: number
    volume: number
}

export type WatchlistItem = {
    ticker: string
    change: number
}
