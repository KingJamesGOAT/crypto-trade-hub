import { useEffect, useRef, useState, useCallback } from 'react'

export interface BinanceKline {
  t: number // Open time
  o: string // Open price
  h: string // High price
  l: string // Low price
  c: string // Close price
  v: string // Base asset volume
  x: boolean // Is this kline closed?
}

export interface BinanceTrade {
  s: string // Symbol
  p: string // Price
  q: string // Quantity
  T: number // Trade time
}

type StreamData = {
  kline?: {
    symbol: string
    kline: BinanceKline
  }
  trade?: BinanceTrade
}

export function useBinanceStream(activeSymbols: string[]) {
  const [streamData, setStreamData] = useState<StreamData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  
  // Reconnect handling
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    if (activeSymbols.length === 0) return

    // Construct Stream URL
    // Format: <symbol>@kline_1m/<symbol>@aggTrade
    // Names must be lowercase for streams
    const streams = activeSymbols.map(s => `${s.toLowerCase()}@kline_1m/${s.toLowerCase()}@aggTrade`).join('/')
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`

    // Close existing
    if (wsRef.current) {
        wsRef.current.close()
    }

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      console.log(`Connected to Binance Stream for ${activeSymbols.length} pairs`)
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        // message format from combined stream: { stream: "...", data: { ... } }
        
        if (!message.data) return

        const data = message.data
        
        // Handle Kline (Candle)
        if (data.e === 'kline') {
           setStreamData({
               kline: {
                   symbol: data.s,
                   kline: data.k
               }
           })
        }
        
        // Handle AggTrade
        if (data.e === 'aggTrade') {
            setStreamData({
                trade: {
                    s: data.s,
                    p: data.p,
                    q: data.q,
                    T: data.T
                }
            })
        }

      } catch (err) {
        console.error("WS Parse Error", err)
      }
    }

    ws.onclose = () => {
      console.log("Binance Stream Disconnected")
      setIsConnected(false)
      // Attempt reconnect after 5s
      reconnectTimeoutRef.current = setTimeout(connect, 5000)
    }

    ws.onerror = (err) => {
      console.error("Binance WS Error", err)
      ws.close()
    }

  }, [activeSymbols])

  // Effect to manage connection lifecyle
  // Fix: Use a ref to track the current activeSymbols string to prevent loop
  const activeSymbolsStr = JSON.stringify(activeSymbols)
  const prevSymbolsRef = useRef(activeSymbolsStr)

  useEffect(() => {
    // Only reconnect if symbols actually changed from previous connection attempt
    // or if we are unconnected.
    // The previous implementation was reconnecting on every render if the array ref changed.
    
    if (activeSymbolsStr === prevSymbolsRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
        return // Skip if same symbols and already open
    }
    
    prevSymbolsRef.current = activeSymbolsStr
    connect()

    return () => {
      // Clean up only if we are actually unmounting or changing symbols
      // We don't blindly close here because the strict mode double-invoke might kill it.
      // But for safety, we DO close on cleanup to prevent leaks.
      if (wsRef.current) {
          console.log("Cleaning up WS connection")
          wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    }
  }, [connect, activeSymbolsStr])

  return { streamData, isConnected }
}
