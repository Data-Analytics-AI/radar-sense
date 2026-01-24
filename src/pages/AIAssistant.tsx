import { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send,
  MessageSquare,
  FileText,
  AlertTriangle,
  Loader2,
  Trash2,
  Bot,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAIChat } from '@/hooks/useAIChat';
import { cn } from '@/lib/utils';

const suggestedQueries = [
  "Why was transaction TXN-A7X3F2 flagged?",
  "Show me structuring patterns for CUST-4521",
  "What are the top fraud indicators this week?",
  "Draft a SAR narrative for case CASE-B9K2M",
  "Compare customer behavior to their peer group",
];

const AIAssistant = () => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat({
    onError: (error) => {
      toast({
        title: "AI Assistant Error",
        description: error,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Investigation Assistant
          </h1>
          <p className="text-muted-foreground">Powered by advanced AI for fraud analysis</p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearMessages}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          )}
          <Badge variant="outline" className="border-primary/30 text-primary">
            <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
            Connected
          </Badge>
        </div>
      </div>
      
      {/* Chat container */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Messages */}
        <div className="flex-1 flex flex-col stat-card p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-lg font-semibold mb-2">How can I help you today?</h2>
                <p className="text-muted-foreground text-center max-w-md text-sm mb-6">
                  I can help you analyze transactions, explain risk scores, 
                  identify fraud patterns, and draft SAR narratives.
                </p>
                <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                  {suggestedQueries.slice(0, 3).map((query, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(query)}
                      className="text-left text-sm p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' && 'flex-row-reverse'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      message.role === 'assistant' ? 'bg-primary/20' : 'bg-muted'
                    )}>
                      {message.role === 'assistant' ? (
                        <Bot className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className={cn(
                      'flex-1 rounded-lg p-4 max-w-[80%]',
                      message.role === 'assistant' 
                        ? 'bg-muted/50 border border-border' 
                        : 'bg-primary/10 border border-primary/20 ml-auto'
                    )}>
                      <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap text-sm">
                        {message.content || (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Thinking...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {/* Input */}
          <div className="p-4 border-t border-border">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask about transactions, patterns, or cases..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-80 space-y-4">
          <div className="stat-card">
            <h3 className="text-sm font-medium mb-3">Suggested Queries</h3>
            <div className="space-y-2">
              {suggestedQueries.map((query, i) => (
                <button
                  key={i}
                  onClick={() => setInput(query)}
                  className="w-full text-left text-xs p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
          
          <div className="stat-card">
            <h3 className="text-sm font-medium mb-3">Capabilities</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-warning" />
                Alert Analysis & Explanation
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 text-primary" />
                SAR Narrative Drafting
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3 w-3 text-success" />
                Pattern Detection Queries
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
