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
        // Convert to UTC hours for consistent checking
        const utcHour = now.getUTCHours()
        
        let newStatus = []
        
        // Market Hours (approx UTC)
        // ASIA (Tokyo): 00:00 - 09:00
        // LONDON: 07:00 - 16:00
        // NY: 13:00 - 22:00
        // ZURICH: 08:00 - 17:00 (Adding Zurich as it's the requested timezone context, often overlaps London)

        if (utcHour >= 0 && utcHour < 9) {
            newStatus.push({ label: "ASIA", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" })
        }
        if (utcHour >= 7 && utcHour < 16) {
             newStatus.push({ label: "LONDON", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" })
        }
        if (utcHour >= 13 && utcHour < 22) {
             newStatus.push({ label: "NEW YORK", color: "bg-green-500/10 text-green-400 border-green-500/20" })
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
