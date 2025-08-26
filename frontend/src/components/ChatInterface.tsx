import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
  totalDocuments?: number;
}

interface ChatResponse {
  pergunta: string;
  resposta: string;
  fontes: string[];
  total_documentos: number;
  tempo_resposta?: number;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Olá! Sou seu assistente de IA para documentos PDF. Faça uma pergunta sobre os documentos processados e eu te ajudo a encontrar a informação.",
      timestamp: new Date(),
    },
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [topK, setTopK] = useState(4);
  const [threshold, setThreshold] = useState(0.7);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/rag/perguntar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pergunta: inputValue,
          top_k: topK,
          threshold: threshold,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.resposta,
        timestamp: new Date(),
        sources: data.fontes,
        totalDocuments: data.total_documentos,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Corrigido: só chama toFixed se tempo_resposta for definido e for número
      let tempoRespostaStr = "";
      if (typeof data.tempo_resposta === "number" && !isNaN(data.tempo_resposta)) {
        tempoRespostaStr = `${data.tempo_resposta.toFixed(2)}s`;
      } else {
        tempoRespostaStr = "tempo não informado";
      }

      toast({
        title: "Resposta gerada com sucesso!",
        description: `Encontrados ${data.total_documentos} documentos relevantes em ${tempoRespostaStr}`,
      });

    } catch (error) {
      console.error("Erro ao enviar pergunta:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua pergunta. Verifique se o backend está rodando, se há documentos processados e tente novamente.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Erro na comunicação",
        description: "Não foi possível conectar ao servidor. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Chat RAG</h2>
          <p className="text-muted-foreground">
            Pergunte sobre seus documentos PDF processados
          </p>
        </div>

        {/* Quick Settings */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Top-K:</label>
            <Input
              type="number"
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-20"
              min="1"
              max="10"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Threshold:</label>
            <Input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-20"
              min="0"
              max="1"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-4",
              message.type === "user" && "flex-row-reverse"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              message.type === "user" 
                ? "bg-gradient-primary" 
                : "bg-surface border border-border"
            )}>
              {message.type === "user" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-foreground" />
              )}
            </div>

            {/* Message Content */}
            <div className={cn(
              "flex-1 max-w-3xl",
              message.type === "user" && "flex justify-end"
            )}>
              <Card className={cn(
                "p-4 shadow-card",
                message.type === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-surface"
              )}>
                <div className="prose prose-sm max-w-none">
                  <p className="mb-0 whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Fontes ({message.totalDocuments} documentos):
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((source, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-background/50"
                        >
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className="mt-2 text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </Card>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center">
              <Bot className="w-4 h-4 text-foreground" />
            </div>
            <Card className="p-4 bg-surface">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-muted-foreground">Processando sua pergunta...</span>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-border bg-surface">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua pergunta sobre os documentos..."
              disabled={isLoading}
              className="bg-background border-border focus:border-primary"
            />
          </div>
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Pressione Enter para enviar • Ajuste Top-K e Threshold para melhor precisão
        </div>
      </div>
    </div>
  );
};