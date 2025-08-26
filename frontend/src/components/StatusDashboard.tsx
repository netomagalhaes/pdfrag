import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity,
  Server, 
  Database, 
  Cpu, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SystemHealth {
  status: string;
  uptime?: string;
  version?: string;
  timestamp: string;
}

interface RAGHealth {
  status: string;
  modelo_disponivel: boolean;
  chroma_conectado: boolean;
  detalhes?: {
    modelo: string;
    embeddings_model: string;
    colecao_ativa: boolean;
  };
}

interface AppConfig {
  openai_model: string;
  chunk_size: number;
  chunk_overlap: number;
  top_k_default: number;
  similarity_threshold: number;
  chroma_collection_name: string;
  debug: boolean;
}

export const StatusDashboard = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [ragHealth, setRAGHealth] = useState<RAGHealth | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchAllStatus = async () => {
    setIsRefreshing(true);
    try {
      // Fetch all endpoints in parallel
      const [systemResponse, ragResponse, configResponse] = await Promise.all([
        fetch("http://localhost:8000/health").catch(() => null),
        fetch("http://localhost:8000/rag/health").catch(() => null),
        fetch("http://localhost:8000/config").catch(() => null),
      ]);

      if (systemResponse?.ok) {
        const systemData = await systemResponse.json();
        setSystemHealth(systemData);
      }

      if (ragResponse?.ok) {
        const ragData = await ragResponse.json();
        setRAGHealth(ragData);
      }

      if (configResponse?.ok) {
        const configData = await configResponse.json();
        setAppConfig(configData);
      }

    } catch (error) {
      console.error("Erro ao buscar status:", error);
      toast({
        title: "Erro ao carregar status",
        description: "Verifique se o backend está executando.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string | boolean | undefined) => {
    if (status === "healthy" || status === "online" || status === true) {
      return <CheckCircle className="w-5 h-5 text-success" />;
    } else if (status === "warning") {
      return <AlertCircle className="w-5 h-5 text-warning" />;
    } else {
      return <XCircle className="w-5 h-5 text-destructive" />;
    }
  };

  const getStatusBadge = (status: string | boolean | undefined) => {
    if (status === "healthy" || status === "online" || status === true) {
      return <Badge className="bg-success text-success-foreground">Online</Badge>;
    } else if (status === "warning") {
      return <Badge variant="outline" className="border-warning text-warning">Atenção</Badge>;
    } else {
      return <Badge variant="destructive">Offline</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Status do Sistema</h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real dos serviços
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchAllStatus}
          disabled={isRefreshing}
          className="gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Atualizar
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* API Status */}
          <Card className="bg-surface shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">API Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(systemHealth?.status)}
                    {getStatusBadge(systemHealth?.status)}
                  </div>
                </div>
                <Server className="w-8 h-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>

          {/* RAG Service */}
          <Card className="bg-surface shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">RAG Service</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(ragHealth?.status)}
                    {getStatusBadge(ragHealth?.status)}
                  </div>
                </div>
                <Activity className="w-8 h-8 text-tech-accent opacity-60" />
              </div>
            </CardContent>
          </Card>

          {/* OpenAI Model */}
          <Card className="bg-surface shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">OpenAI Model</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(ragHealth?.modelo_disponivel)}
                    {getStatusBadge(ragHealth?.modelo_disponivel)}
                  </div>
                </div>
                <Cpu className="w-8 h-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>

          {/* ChromaDB */}
          <Card className="bg-surface shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">ChromaDB</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(ragHealth?.chroma_conectado)}
                    {getStatusBadge(ragHealth?.chroma_conectado)}
                  </div>
                </div>
                <Database className="w-8 h-8 text-tech-accent opacity-60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Information */}
          <Card className="bg-surface shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="text-foreground font-medium">
                    {systemHealth?.status || "Carregando..."}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Uptime:</span>
                  <p className="text-foreground font-medium">
                    {systemHealth?.uptime || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Versão:</span>
                  <p className="text-foreground font-medium">
                    {systemHealth?.version || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Última verificação:</span>
                  <p className="text-foreground font-medium">
                    {systemHealth?.timestamp ? 
                      new Date(systemHealth.timestamp).toLocaleTimeString() : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RAG Configuration */}
          <Card className="bg-surface shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Configuração RAG</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Modelo OpenAI:</span>
                  <p className="text-foreground font-medium">
                    {ragHealth?.detalhes?.modelo || appConfig?.openai_model || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Embeddings Model:</span>
                  <p className="text-foreground font-medium">
                    {ragHealth?.detalhes?.embeddings_model || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Coleção Ativa:</span>
                  <p className="text-foreground font-medium">
                    {ragHealth?.detalhes?.colecao_ativa ? "Sim" : "Não"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Collection Name:</span>
                  <p className="text-foreground font-medium">
                    {appConfig?.chroma_collection_name || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Configuration */}
        {appConfig && (
          <Card className="bg-surface shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Configuração da Aplicação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Chunk Size:</span>
                  <p className="text-foreground font-medium">{appConfig.chunk_size}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Chunk Overlap:</span>
                  <p className="text-foreground font-medium">{appConfig.chunk_overlap}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Top-K Default:</span>
                  <p className="text-foreground font-medium">{appConfig.top_k_default}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Similarity Threshold:</span>
                  <p className="text-foreground font-medium">{appConfig.similarity_threshold}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Debug Mode:</span>
                  <p className="text-foreground font-medium">
                    {appConfig.debug ? "Ativo" : "Desativo"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};