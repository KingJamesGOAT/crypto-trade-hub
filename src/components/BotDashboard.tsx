import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Terminal, Activity, RefreshCw } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase (Frontend)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null

interface Log {
    id: number
    timestamp: string
    message: string
}

export function BotDashboard() {
    const [logs, setLogs] = useState<Log[]>([])

    // Fetch logs on load and subscribe to new ones
    useEffect(() => {
        if (!supabase) return

        const fetchLogs = async () => {
            const { data } = await supabase
                .from('sim_logs')
                .select('*')
                .order('id', { ascending: false })
                .limit(50)
            if (data) setLogs(data)
        }

        fetchLogs()

        // Realtime Listener for new logs
        const channel = supabase
            .channel('realtime-logs')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sim_logs' }, (payload) => {
                setLogs(prev => [payload.new as Log, ...prev])
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    return (
        <Card className="h-[600px] flex flex-col border-primary/20 bg-black/40 backdrop-blur-md">
            <CardHeader className="border-b border-white/10 bg-black/20">
                <CardTitle className="flex items-center gap-2 text-sm font-mono text-muted-foreground uppercase tracking-wider">
                    <Terminal className="h-4 w-4 text-green-500" />
                    Live Neural Terminal
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 font-mono text-xs">
                <ScrollArea className="h-full p-4">
                    {logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 gap-2">
                            <Activity className="h-8 w-8 animate-pulse" />
                            <span>Waiting for Ghost Bot signal...</span>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {logs.map((log) => (
                                <div key={log.id} className="flex gap-3 border-l-2 border-white/5 pl-3 hover:bg-white/5 p-1 rounded transition-colors">
                                    <span className="text-muted-foreground w-20 shrink-0 opacity-50">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className={`${
                                        log.message.includes("BOUGHT") ? "text-green-400 font-bold" :
                                        log.message.includes("SOLD") ? "text-orange-400 font-bold" :
                                        log.message.includes("Skipped") ? "text-yellow-500/70" :
                                        "text-blue-200"
                                    }`}>
                                        {log.message}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
