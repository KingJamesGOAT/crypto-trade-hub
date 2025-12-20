import { useState, useRef, useEffect } from "react";
import { useSimulator } from "@/context/SimulatorContext";
import { geminiService, type ChatMessage } from "@/api/gemini-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Sparkles, Loader2, Minimize2 } from "lucide-react";

export function AIChat() {
  const { portfolio } = useSimulator();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "model", content: "Hello! I'm your Gemini AI assistant. Ask me about your portfolio or market strategies." }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
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
      // 1. Prepare Context
      const portfolioSummary = JSON.stringify({
          balance: portfolio.simulator.currentBalance,
          positions: portfolio.holdings,
          recentTrades: portfolio.trades.slice(0, 5)
      }, null, 2);

      // 2. Call Service
      const responseText = await geminiService.sendMessage(
          messages, 
          userMsg.content, 
          portfolioSummary
      );

      // 3. Add Reply
      setMessages(prev => [...prev, { role: "model", content: responseText }]);

    } catch (error) {
       setMessages(prev => [...prev, { role: "model", content: "Sorry, I encountered an error. Please try again." }]);
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
    <Card className="fixed bottom-6 right-6 w-[380px] h-[500px] shadow-2xl z-50 flex flex-col border-blue-500/20 animate-in slide-in-from-bottom-10 fade-in duration-200">
      <CardHeader className="p-4 border-b bg-blue-500/5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-blue-600">
                <AvatarFallback><Sparkles className="h-4 w-4 text-white" /></AvatarFallback>
            </Avatar>
            <div>
                <CardTitle className="text-sm font-bold">Gemini Assistant</CardTitle>
                <p className="text-xs text-muted-foreground">Context-Aware AI</p>
            </div>
        </div>
        <div className="flex gap-1">
             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleChat}>
                <Minimize2 className="h-4 w-4" />
             </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden relative">
          <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`
                          max-w-[80%] rounded-2xl px-4 py-2 text-sm
                          ${msg.role === "user" 
                            ? "bg-blue-600 text-white rounded-br-none" 
                            : "bg-muted text-foreground rounded-bl-none border"}
                      `}>
                          {msg.content}
                      </div>
                  </div>
              ))}
              {isLoading && (
                  <div className="flex justify-start">
                       <div className="bg-muted rounded-2xl px-4 py-2 rounded-bl-none border flex items-center gap-2 text-sm text-muted-foreground">
                           <Loader2 className="h-3 w-3 animate-spin" />
                           Thinking...
                       </div>
                  </div>
              )}
          </div>
      </CardContent>

      <CardFooter className="p-4 border-t bg-background/50 backdrop-blur-sm">
          <div className="flex w-full gap-2">
              <Input 
                value={input} 
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your portfolio..."
                disabled={isLoading}
                className="bg-background"
              />
              <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
              </Button>
          </div>
      </CardFooter>
    </Card>
  );
}
