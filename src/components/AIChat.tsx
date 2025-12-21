import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { aiService, type ChatMessage } from "@/api/gemini-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Sparkles, Loader2, Minimize2, LogIn } from "lucide-react";

export function AIChat() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPuterSignedIn, setIsPuterSignedIn] = useState(false);
  const [puterUsername, setPuterUsername] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: "model", 
      content: "Hello! I'm your AI assistant. Sign in with Puter to start chatting!" 
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check Puter auth status and auto-trigger sign-in
  useEffect(() => {
    const checkAuth = async () => {
      const signedIn = await aiService.isSignedIn();
      setIsPuterSignedIn(signedIn);
      if (signedIn) {
        const username = await aiService.getUsername();
        setPuterUsername(username);
      } else if (isOpen) {
        // Auto-trigger sign-in when chat opens
        setTimeout(() => {
          handleSignIn();
        }, 500);
      }
    };
    checkAuth();
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSignIn = async () => {
    const success = await aiService.signIn();
    if (success) {
      setIsPuterSignedIn(true);
      const username = await aiService.getUsername();
      setPuterUsername(username);
      setMessages([{ 
        role: "model", 
        content: `Welcome ${username}! Ask me about crypto or trading strategies!` 
      }]);
    }
  };

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

  // Don't show AI chat if not authenticated
  if (!isAuthenticated) {
    return null;
  }

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
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col border-blue-500/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-blue-600 to-cyan-500">
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Assistant
          {puterUsername && <span className="text-xs opacity-80">({puterUsername})</span>}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleChat}
          className="text-white hover:bg-white/20"
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {!isPuterSignedIn && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-center text-muted-foreground">
              Sign in with Puter to use the AI assistant
            </p>
            <Button onClick={handleSignIn} className="bg-blue-600 hover:bg-blue-700">
              <LogIn className="h-4 w-4 mr-2" />
              Sign in with Puter
            </Button>
          </div>
        )}

        {isPuterSignedIn && messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "model" && (
              <Avatar className="h-8 w-8 bg-blue-600">
                <AvatarFallback className="bg-blue-600 text-white">AI</AvatarFallback>
              </Avatar>
            )}
            <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
              msg.role === "user" 
                ? "bg-blue-600 text-white" 
                : "bg-muted"
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === "user" && (
              <Avatar className="h-8 w-8 bg-cyan-600">
                <AvatarFallback className="bg-cyan-600 text-white">U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Avatar className="h-8 w-8 bg-blue-600">
              <AvatarFallback className="bg-blue-600 text-white">AI</AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-lg px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </CardContent>

      {isPuterSignedIn && (
        <CardFooter className="p-4 border-t">
          <div className="flex w-full gap-2">
            <Input
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
