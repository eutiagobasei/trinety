import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-2xl px-6">
        <h1 className="mb-4 text-5xl font-bold text-primary">Trinity Hub</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Plataforma de Criação de Planejamento Estratégico
        </p>
        <p className="text-foreground mb-8">
          Crie e gerencie seu planejamento estratégico de forma estruturada e eficiente.
        </p>
        <Button size="lg" onClick={() => navigate("/login")}>
          Acessar Plataforma
        </Button>
      </div>
    </div>
  );
};

export default Index;
