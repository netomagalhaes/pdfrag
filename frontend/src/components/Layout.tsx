import { useState } from "react";
import { MessageCircle, FileText, Activity, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout = ({ children, activeTab, onTabChange }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { id: "chat", name: "Chat RAG", icon: MessageCircle },
    { id: "documents", name: "Documentos", icon: FileText },
    { id: "status", name: "Status", icon: Activity },
    { id: "settings", name: "Configurações", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col bg-surface border-r border-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Header */}
        <div className="flex items-center p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-foreground">PDF RAG</h1>
                <p className="text-xs text-muted-foreground">AI Assistant</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigation.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 transition-all duration-200",
                  activeTab === item.id && "bg-primary text-primary-foreground shadow-glow",
                  !sidebarOpen && "justify-center"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <item.icon className="w-4 h-4" />
                {sidebarOpen && item.name}
              </Button>
            ))}
          </div>
        </nav>

        {/* Toggle Sidebar */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full"
          >
            <MessageCircle className="w-4 h-4" />
            {sidebarOpen && <span className="ml-2">Ocultar</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};