import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ChatInterface } from "@/components/ChatInterface";
import { DocumentsManager } from "@/components/DocumentsManager";
import { StatusDashboard } from "@/components/StatusDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  FileText, 
  MessageCircle, 
  Activity,
  Github,
  BookOpen
} from "lucide-react";

const SettingsPanel = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
          <p className="text-muted-foreground">
            Configurações do sistema e informações
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card className="bg-surface shadow-card">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Sobre o Sistema</h3>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Este frontend foi criado para interagir com a API PDF RAG usando FastAPI, ChromaDB e OpenAI.
                O sistema permite processar documentos PDF e fazer perguntas usando Retrieval-Augmented Generation.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2">
                  <Github className="w-4 h-4" />
                  Repositório
                </Button>
                <Button variant="outline" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Documentação
                </Button>
              </div>

              <div className="mt-6 p-4 bg-background rounded-lg border border-border">
                <h4 className="font-medium text-foreground mb-2">Tecnologias Utilizadas</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                  <div>• React + TypeScript</div>
                  <div>• Tailwind CSS</div>
                  <div>• Shadcn/ui</div>
                  <div>• FastAPI Backend</div>
                  <div>• ChromaDB</div>
                  <div>• OpenAI GPT</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface shadow-card">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Como Usar</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <strong className="text-foreground">Adicione seus PDFs:</strong> Coloque os arquivos PDF na pasta <code className="bg-background px-1 rounded">base/</code> do backend
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <strong className="text-foreground">Processe os documentos:</strong> Use a seção "Documentos" para processar os PDFs
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <strong className="text-foreground">Faça perguntas:</strong> Use o "Chat RAG" para fazer perguntas sobre o conteúdo
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</div>
                <div>
                  <strong className="text-foreground">Monitore o sistema:</strong> Acompanhe o status dos serviços na aba "Status"
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("chat");

  const renderContent = () => {
    switch (activeTab) {
      case "chat":
        return <ChatInterface />;
      case "documents":
        return <DocumentsManager />;
      case "status":
        return <StatusDashboard />;
      case "settings":
        return <SettingsPanel />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <>
      <title>PDF RAG - AI Assistant</title>
      <meta name="description" content="Interface para interagir com documentos PDF usando Retrieval-Augmented Generation (RAG)" />
      
      <div className="min-h-screen bg-background">
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
          {renderContent()}
        </Layout>
      </div>
    </>
  );
};

export default Index;