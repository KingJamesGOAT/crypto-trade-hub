import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface OHLC {
    high: number
    low: number
    close: number
}

// --- QUANT INDICATORS ---

// 1. True Range (Volatilty helper)
export function calculateTR(high: number, low: number, prevClose: number): number {
    const hl = high - low
    const hpc = Math.abs(high - prevClose)
    const lpc = Math.abs(low - prevClose)
    return Math.max(hl, hpc, lpc)
}

// 2. Average True Range (Smoothed)
export function calculateATR(candles: OHLC[], period: number = 14): number {
    if (candles.length < period + 1) return 0
    
    // Initial ATR = SMA of TR for first 'period'
    let trSum = 0
    for (let i = 1; i <= period; i++) {
        trSum += calculateTR(candles[i].high, candles[i].low, candles[i-1].close)
    }
    let atr = trSum / period
    
    // Wilder's Smoothing for rest
    for (let i = period + 1; i < candles.length; i++) {
        const tr = calculateTR(candles[i].high, candles[i].low, candles[i-1].close)
        atr = ((atr * (period - 1)) + tr) / period
    }
    
    return atr
}

// 3. Average Directional Index (Trend Strength)
export function calculateADX(candles: OHLC[], period: number = 14): number {
    if (candles.length < period * 2) return 0 // Need enough history for smoothing
    
    // Arrays to store smoothed DM and TR
    let plusDM: number[] = []
    let minusDM: number[] = []
    let tr: number[] = []
    
    // 1. Calculate TR, +DM, -DM
    for (let i = 1; i < candles.length; i++) {
        const curr = candles[i]
        const prev = candles[i-1]
        
        const upMove = curr.high - prev.high
        const downMove = prev.low - curr.low
        
        // +DM
        let pdm = 0
        if (upMove > downMove && upMove > 0) pdm = upMove
        
        // -DM
        let mdm = 0
        if (downMove > upMove && downMove > 0) mdm = downMove
        
        tr.push(calculateTR(curr.high, curr.low, prev.close))
        plusDM.push(pdm)
        minusDM.push(mdm)
    }
    
    // 2. Wilder's Smoothing Helper
    const smooth = (data: number[], per: number, startIdx: number = 0): number[] => {
        const smoothed: number[] = []
        // First value is sum
        let sum = 0
        for (let i = 0; i < per; i++) sum += data[startIdx + i]
        smoothed.push(sum) // Index 0 of smoothed corresponds to index 'startIdx + per - 1' of data
        
        // Subsequent are (Prev * (N-1) + Curr) / N
        for (let i = startIdx + per; i < data.length; i++) {
            const val = ((smoothed[smoothed.length - 1] * (per - 1)) + data[i]) / per
            smoothed.push(val)
        }
        return smoothed
    }
    
    // Smooth TR, +DM, -DM
    const smoothTR = smooth(tr, period)
    const smoothPDM = smooth(plusDM, period)
    const smoothMDM = smooth(minusDM, period)
    
    // 3. Calculate DX
    const dxList: number[] = []
    const limit = Math.min(smoothTR.length, smoothPDM.length, smoothMDM.length)
    
    for (let i = 0; i < limit; i++) {
        const pdi = (smoothPDM[i] / smoothTR[i]) * 100
        const mdi = (smoothMDM[i] / smoothTR[i]) * 100
        
        const sum = pdi + mdi
        const diff = Math.abs(pdi - mdi)
        
        const dx = sum === 0 ? 0 : (diff / sum) * 100
        dxList.push(dx)
    }
    
    // 4. Calculate ADX (SMA of DX)
    if (dxList.length < period) return dxList[dxList.length - 1] // Fallback
    
    // First ADX is average of first 'period' DX values
    let adxSum = 0
    for(let i=0; i<period; i++) adxSum += dxList[i]
    let adx = adxSum / period
    
    // Smooth ADX
    for(let i=period; i<dxList.length; i++) {
        adx = ((adx * (period - 1)) + dxList[i]) / period
    }
    
    return adx
}

// 4. Kelly Criterion (Position Sizing)
export function calculateKellySize(winRate: number, riskReward: number): number {
    // f = (p(b + 1) - 1) / b
    // p = winRate, b = riskReward
    if (riskReward === 0) return 0
    const f = (winRate * (riskReward + 1) - 1) / riskReward
    return Math.max(0, f) // Never return negative size
}
