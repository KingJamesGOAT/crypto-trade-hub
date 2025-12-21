import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useAuth } from "@/context/AuthContext";
import { aiService, type ChatMessage } from "@/api/gemini-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Sparkles, Loader2, Minimize2 } from "lucide-react";

// REPLACE WITH YOUR PUTER USERNAME TO LOCK IT DOWN
const ADMIN_USERNAME = ""; // e.g., "kingjamesgoat" (Leave empty to allow all logged-in users)

export function AIChat() {
  const { isAuthenticated, username } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Chat on Load
  useEffect(() => {
    if (isAuthenticated && messages.length === 0) {
       setMessages([{ 
         role: "model", 
         content: `Welcome back, ${username || 'Admin'}! The market scanner is active. What shall we analyze?` 
       }]);
    }
  }, [isAuthenticated, username]);

  // 2. Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Direct call - Puter session is already active from App Login
      const response = await aiService.chat(userMsg.content);
      setMessages(prev => [...prev, { role: "model", content: response }]);
    } catch (error) {
       setMessages(prev => [...prev, { role: "model", content: "I'm having trouble connecting. Please check your internet or Puter status." }]);
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

  // --- ADMIN GATEKEEPER LOGIC ---
  
  // 1. Must be logged in
  if (!isAuthenticated) return null;

  // 2. (Optional) Must be the specific Admin Username
  if (ADMIN_USERNAME && username !== ADMIN_USERNAME) return null;


  // --- RENDER ---

  if (!isOpen) {
    return (
      <Button 
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 z-50 transition-transform hover:scale-105"
        onClick={toggleChat}
      >
        <Sparkles className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col border-blue-500/20 bg-slate-950 text-white animate-in slide-in-from-bottom-5 duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-t-xl">
        <CardTitle className="text-white flex items-center gap-2 text-md">
          <Sparkles className="h-5 w-5" />
          AI Analyst
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleChat}
          className="text-white hover:bg-white/20 h-8 w-8"
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "model" && (
                <Avatar className="h-8 w-8 border border-blue-500/30">
                  <AvatarFallback className="bg-blue-600/20 text-blue-400 text-xs">AI</AvatarFallback>
                </Avatar>
              )}
              <div className={`rounded-lg px-4 py-2 max-w-[85%] text-sm ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-800 text-slate-200 border border-slate-700"
              }`}>
                <ReactMarkdown
                  rehypePlugins={[rehypeSanitize]}
                  components={{
                    p: ({node, ...props}) => <p className="mb-1 last:mb-0 leading-relaxed" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-300 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    code: ({node, ...props}) => <code className="bg-black/30 rounded px-1 py-0.5 text-xs font-mono" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-blue-200" {...props} />
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-pulse">
              <Avatar className="h-8 w-8 border border-blue-500/30">
                <AvatarFallback className="bg-blue-600/20 text-blue-400 text-xs">AI</AvatarFallback>
              </Avatar>
              <div className="bg-slate-800 rounded-lg px-4 py-2 border border-slate-700 flex items-center">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400 mr-2" />
                <span className="text-xs text-slate-400">Analyzing...</span>
              </div>
            </div>
          )}
      </CardContent>

      <CardFooter className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex w-full gap-2">
          <Input
            placeholder="Ask about the market..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 bg-slate-950 border-slate-700 text-white focus-visible:ring-blue-500"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
