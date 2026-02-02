export type StockNode = {
    name: string
    ticker: string
    value: number // Market Cap
    performance: number // % Change
    pe_ratio: number // Y-Axis
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
