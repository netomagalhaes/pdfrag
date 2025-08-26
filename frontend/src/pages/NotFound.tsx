import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full p-8 text-center bg-surface shadow-card">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-foreground">404</h1>
          <p className="text-xl text-muted-foreground mb-4">Página não encontrada</p>
          <p className="text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <Link to="/">
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2">
            <Home className="w-4 h-4" />
            Voltar ao Início
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;
