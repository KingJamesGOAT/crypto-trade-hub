import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, Globe } from "lucide-react"

export function SessionClock() {
    const [time, setTime] = useState(new Date())
    const [status, setStatus] = useState<{ label: string, color: string, icon?: any }>({ label: "OFFLINE", color: "bg-slate-500" })

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
        const utcHour = now.getUTCHours()
        
        let active = []
        
        // Market Hours (approx UTC)
        // ASIA (Tokyo): 00:00 - 09:00
        // LONDON: 07:00 - 16:00
        // NY: 13:00 - 22:00
        
        if (utcHour >= 0 && utcHour < 9) active.push("ASIA")
        if (utcHour >= 7 && utcHour < 16) active.push("LONDON")
        if (utcHour >= 13 && utcHour < 22) active.push("NEW YORK")
        
        if (active.length === 0) {
             setStatus({ label: "Mkts Closed", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" })
        } else if (active.length > 1) {
             setStatus({ label: "⚡ OVERLAP", color: "bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse" })
        } else {
             const session = active[0]
             if (session === "ASIA") setStatus({ label: "ASIA", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" })
             if (session === "LONDON") setStatus({ label: "LONDON", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" })
             if (session === "NEW YORK") setStatus({ label: "NEW YORK", color: "bg-green-500/10 text-green-400 border-green-500/20" })
        }
    }

    return (
        <div className="flex items-center gap-3 hidden md:flex">
             {/* Clock */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-mono text-slate-300">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC
                </span>
            </div>

            {/* Session Badge */}
            <Badge variant="outline" className={`text-[10px] font-bold tracking-wider flex items-center gap-1.5 px-2 py-0.5 h-7 ${status.color}`}>
                <Globe className="h-3 w-3" />
                {status.label}
            </Badge>
        </div>
    )
}
