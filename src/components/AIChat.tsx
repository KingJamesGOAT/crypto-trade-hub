import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useAuth } from "@/context/AuthContext";
import { aiService, type ChatMessage } from "@/api/gemini-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, X, Zap, ChevronDown } from "lucide-react";

export function AIChat() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && messages.length === 0) {
       setMessages([{ 
         role: "model", 
         content: `**Online.** I'm connected to the CryptoHub Engine. Ask me about the current *Strategy Logic*, *Backtest results*, or market trends.` 
       }]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await aiService.chat(userMsg.content);
      setMessages(prev => [...prev, { role: "model", content: response }]);
    } catch (error) {
       setMessages(prev => [...prev, { role: "model", content: "Connection interrupted." }]);
    } finally {
       setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  };

  if (!isAuthenticated) return null;

  // MODERN FLOATING TRIGGER
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 group flex items-center gap-2 px-4 py-3 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 shadow-2xl hover:bg-blue-600/90 hover:border-blue-500 transition-all duration-300 z-50"
      >
        <div className="relative">
            <Bot className="h-6 w-6 text-blue-400 group-hover:text-white transition-colors" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-slate-950"></span>
        </div>
        <span className="text-sm font-semibold text-slate-200 group-hover:text-white pr-1">AI Analyst</span>
      </button>
    );
  }

  // MODERN CHAT WINDOW (Glassmorphism)
  return (
    <div className="fixed bottom-6 right-6 w-[400px] h-[600px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-950/80 backdrop-blur-xl z-50 animate-in slide-in-from-bottom-5 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 border-b border-slate-800">
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <Zap className="h-4 w-4 text-blue-400 fill-blue-400" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-white">Hub Intelligence</h3>
                <p className="text-[10px] text-green-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"/> 
                    System Active
                </p>
            </div>
        </div>
        <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-full">
                <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full">
                <X className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "model" && (
                <div className="h-8 w-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30 shrink-0">
                    <Bot className="h-4 w-4 text-blue-400" />
                </div>
            )}
            <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-br-none" 
                  : "bg-slate-800/50 border border-slate-700/50 text-slate-200 rounded-bl-none backdrop-blur-sm"
            }`}>
               <ReactMarkdown 
                    rehypePlugins={[rehypeSanitize]}
                    components={{
                        strong: ({node, ...props}) => <span className="font-bold text-blue-300" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 my-1 space-y-1" {...props} />,
                        code: ({node, ...props}) => <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-xs text-yellow-300" {...props} />
                    }}
               >
                 {msg.content}
               </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex gap-3">
               <div className="h-8 w-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30 shrink-0">
                    <Bot className="h-4 w-4 text-blue-400" />
                </div>
                <div className="px-4 py-3 bg-slate-800/50 rounded-2xl rounded-bl-none border border-slate-700/50">
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/80 border-t border-slate-800">
        <div className="relative">
            <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about strategy or backtests..."
                className="pr-10 bg-slate-950/50 border-slate-700 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl h-11 text-sm shadow-inner"
            />
            <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
            >
                <Send className="h-3.5 w-3.5" />
            </button>
        </div>
      </div>
    </div>
  );
}
