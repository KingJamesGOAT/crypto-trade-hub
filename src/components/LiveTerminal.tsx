import { useEffect, useState, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Terminal, Wifi } from "lucide-react"

// Initialize Supabase (Frontend)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null

interface BotLog {
    id: number
    created_at: string
    level: 'info' | 'success' | 'error'
    message: string
}

export function LiveTerminal() {
    const [logs, setLogs] = useState<BotLog[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!supabase) return

        // 1. Fetch initial logs
        const fetchInitial = async () => {
            const { data } = await supabase
                .from('bot_logs')
                .select('*')
                .order('id', { ascending: false })
                .limit(50)
            
            if (data) setLogs(data.reverse()) // Show oldest first for terminal feel? Or newest at top?
            // Actually, terminals usually append to bottom. So lets reverse to have oldest at top, newest at bottom.
        }

        fetchInitial()

        // 2. Subscribe
        const channel = supabase
            .channel('bot_logs_realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bot_logs' }, (payload) => {
                setLogs(prev => [...prev.slice(-99), payload.new as BotLog]) // Keep last 100
                // Auto-scroll
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
                }
            })
            .subscribe((status) => {
                setIsConnected(status === 'SUBSCRIBED')
            })

        return () => { supabase.removeChannel(channel) }
    }, [])

    // Auto-scroll effect on new logs
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [logs]);

    return (
        <Card className="flex flex-col border-green-900/50 bg-black shadow-[0_0_20px_rgba(0,255,0,0.1)] h-[400px]">
            <CardHeader className="py-3 px-4 border-b border-white/10 flex flex-row items-center justify-between bg-white/5">
                <CardTitle className="flex items-center gap-2 text-xs font-mono text-green-500 uppercase tracking-widest">
                    <Terminal className="h-3 w-3" />
                    Ghost_Engine_Core
                </CardTitle>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground">Status:</span>
                    <div className={`flex items-center gap-1 text-[10px] ${isConnected ? "text-green-400" : "text-red-500"}`}>
                        <Wifi className="h-3 w-3" />
                        {isConnected ? "ONLINE" : "CONNECTING..."}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden relative font-mono text-xs">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                <ScrollArea className="h-full w-full p-4" ref={scrollRef}>
                    <div className="space-y-1">
                        {logs.map((log) => (
                            <div key={log.id} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                <span className="text-white/20 select-none">
                                    [{new Date(log.created_at).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}]
                                </span>
                                <span className={`${
                                    log.level === 'success' ? "text-green-400 font-bold" :
                                    log.level === 'error' ? "text-red-500 font-bold" :
                                    log.message.includes("Analyzing") ? "text-blue-300/70" :
                                    "text-white/70"
                                }`}>
                                    {log.level === 'success' && "🚀 "}
                                    {log.level === 'error' && "❌ "}
                                    {log.message}
                                </span>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <div className="text-white/20 italic">Initializing detailed connection...</div>
                        )}
                        {/* Fake cursor at the end */}
                        <div className="inline-block w-2 h-4 bg-green-500/50 animate-pulse translate-y-1 ml-1"></div>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
