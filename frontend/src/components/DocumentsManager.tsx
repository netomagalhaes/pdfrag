import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Upload, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentStatus {
  total_documentos: number;
  status: string;
  ultima_atualizacao?: string;
  detalhes?: {
    arquivos_processados?: string[];
    tamanho_colecao?: number;
  };
}

export const DocumentsManager = () => {
  const [status, setStatus] = useState<DocumentStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const fetchStatus = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("http://localhost:8000/documents/status");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        throw new Error(`Erro ${response.status}`);
      }
    } catch (error) {
      console.error("Erro ao buscar status:", error);
      toast({
        title: "Erro ao carregar status",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const processDocuments = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("http://localhost:8000/documents/processar", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Processamento iniciado!",
          description: data.message || "Documentos estão sendo processados.",
        });
        // Aguardar um pouco e atualizar status
        setTimeout(() => {
          fetchStatus();
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro ${response.status}`);
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Erro ao processar documentos:", err);
      toast({
        title: "Erro no processamento",
        description: err.message || "Não foi possível processar os documentos.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Corrigido: tratamento especial para erro 404 e mensagens mais claras
  const uploadAndProcessFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Upload realizado!",
          description: data.message || "Arquivo enviado e será processado.",
        });
        // Atualiza status após um tempo
        setTimeout(() => {
          fetchStatus();
        }, 2000);
      } else {
        // Tenta extrair mensagem de erro do backend, mas trata 404 de forma especial
        let errorMsg = "";
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || `Erro ${response.status}`;
        } catch {
          if (response.status === 404) {
            errorMsg = "Endpoint de upload não encontrado (404). Verifique se o backend está rodando e se a rota /documents/upload existe.";
          } else {
            errorMsg = `Erro ${response.status}`;
          }
        }
        throw new Error(errorMsg);
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Erro ao enviar arquivo:", err);
      let descricao = err.message;
      if (descricao.includes("Not Found") || descricao.includes("404")) {
        descricao = "Não foi possível encontrar o endpoint de upload no backend. Verifique se o backend está rodando e se a rota /documents/upload está implementada.";
      }
      toast({
        title: "Erro no upload",
        description: descricao || "Não foi possível enviar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAndProcessFile(file);
    }
  };

  const clearDocuments = async () => {
    setIsClearing(true);
    try {
      const response = await fetch("http://localhost:8000/documents/limpar", {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Banco limpo!",
          description: data.message || "Todos os documentos foram removidos.",
        });
        fetchStatus();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro ${response.status}`);
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Erro ao limpar documentos:", err);
      toast({
        title: "Erro ao limpar",
        description: err.message || "Não foi possível limpar o banco.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciar Documentos</h2>
          <p className="text-muted-foreground">
            Processe PDFs da pasta base/ e gerencie o banco vetorial
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchStatus}
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Documents */}
          <Card className="bg-surface shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Database className="w-5 h-5 text-primary" />
                Documentos no Banco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {status ? status.total_documentos : "—"}
              </div>
              <p className="text-muted-foreground mt-1">
                Chunks processados
              </p>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="bg-surface shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CheckCircle className="w-5 h-5 text-success" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={status?.status === "online" ? "default" : "destructive"}
                  className="text-sm"
                >
                  {status?.status || "Carregando..."}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                {status?.ultima_atualizacao 
                  ? `Última atualização: ${new Date(status.ultima_atualizacao).toLocaleString()}`
                  : "Aguardando dados..."
                }
              </p>
            </CardContent>
          </Card>

          {/* Collection Size */}
          <Card className="bg-surface shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileText className="w-5 h-5 text-tech-accent" />
                Tamanho da Coleção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {status?.detalhes?.tamanho_colecao || "0"}
              </div>
              <p className="text-muted-foreground mt-1">
                Embeddings armazenados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="bg-surface shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Process Documents */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h3 className="font-medium text-foreground">Processar Documentos</h3>
                <p className="text-sm text-muted-foreground">
                  Processa todos os PDFs da pasta base/ e adiciona ao banco vetorial<br />
                  <span className="block mt-1">Ou envie um novo arquivo PDF para ser processado imediatamente.</span>
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="application/pdf"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isUploading ? "Enviando..." : "Enviar PDF"}
                </Button>
                <Button 
                  onClick={processDocuments}
                  disabled={isProcessing}
                  className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isProcessing ? "Processando..." : "Processar"}
                </Button>
              </div>
            </div>

            {/* Clear Database */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h3 className="font-medium text-foreground">Limpar Banco Vetorial</h3>
                <p className="text-sm text-muted-foreground">
                  Remove todos os documentos processados do banco de dados
                </p>
              </div>
              <Button 
                variant="destructive"
                onClick={clearDocuments}
                disabled={isClearing || (status?.total_documentos || 0) === 0}
                className="gap-2"
              >
                {isClearing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isClearing ? "Limpando..." : "Limpar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Processed Files */}
        {status?.detalhes?.arquivos_processados && status.detalhes.arquivos_processados.length > 0 && (
          <Card className="bg-surface shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Arquivos Processados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {status.detalhes.arquivos_processados.map((arquivo, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded border border-border">
                    <FileText className="w-4 h-4 text-tech-accent" />
                    <span className="text-foreground">{arquivo}</span>
                    <Badge variant="secondary" className="ml-auto">
                      Processado
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-surface shadow-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertCircle className="w-5 h-5 text-primary" />
              Instruções
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>1. <strong>Adicione seus arquivos PDF</strong> na pasta <code className="bg-background px-1 rounded">base/</code> do backend ou envie diretamente pelo botão "Enviar PDF"</p>
              <p>2. <strong>Clique em "Processar"</strong> para extrair o texto e criar embeddings</p>
              <p>3. <strong>Use o Chat RAG</strong> para fazer perguntas sobre o conteúdo</p>
              <p>4. <strong>Ajuste Top-K e Threshold</strong> no chat para melhor precisão</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};