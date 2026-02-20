import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, Globe } from "lucide-react"

export function SessionClock() {
    const [time, setTime] = useState(new Date())
    const [status, setStatus] = useState<{ label: string, color: string }[]>([])

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date()
            setTime(now)
            updateSession(now)
        }, 1000)
        
        updateSession(new Date()) // init

        return () => clearInterval(timer)
    }, [])

    const updateSession = (now: Date) => {
        // Convert to UTC hours and add minutes for decimal precision 
        const utcDecimal = now.getUTCHours() + now.getUTCMinutes() / 60;
        const isWeekend = now.getUTCDay() === 0 || now.getUTCDay() === 6;
        
        let newStatus = [];
        
        // TradFi Market Hours in UTC (Standard Time)
        // Tokyo (ASIA): 09:00 - 15:00 JST -> 00:00 - 06:00 UTC
        // London: 08:00 - 16:30 GMT -> 08:00 - 16:30 UTC
        // New York (NYSE): 09:30 - 16:00 EST -> 14:30 - 21:00 UTC
        
        if (!isWeekend) {
            if (utcDecimal >= 0 && utcDecimal < 6) {
                newStatus.push({ label: "TOKYO", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" })
            }
            if (utcDecimal >= 8 && utcDecimal < 16.5) {
                 newStatus.push({ label: "LONDON", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" })
            }
            if (utcDecimal >= 14.5 && utcDecimal < 21) {
                 newStatus.push({ label: "NEW YORK", color: "bg-green-500/10 text-green-400 border-green-500/20" })
            }
        }
        
        setStatus(newStatus)
    }

    return (
        <div className="flex items-center gap-3 hidden md:flex">
             {/* Clock */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-mono text-slate-300">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich', hour12: false })} ZRH
                </span>
            </div>

            {/* Session Badges */}
            <div className="flex gap-1">
                {status.length > 0 ? (
                    status.map((s) => (
                        <Badge key={s.label} variant="outline" className={`text-[10px] font-bold tracking-wider flex items-center gap-1.5 px-2 py-0.5 h-7 ${s.color}`}>
                            <Globe className="h-3 w-3" />
                            {s.label}
                        </Badge>
                    ))
                ) : (
                    <Badge variant="outline" className="text-[10px] font-bold tracking-wider flex items-center gap-1.5 px-2 py-0.5 h-7 bg-slate-500/10 text-slate-400 border-slate-500/20">
                        <Globe className="h-3 w-3" />
                        MKTS CLOSED
                    </Badge>
                )}
            </div>
        </div>
    )
}
