import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import trinityLogo from "@/assets/trinity-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const { user, organization, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      if (organization) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, organization, isLoading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-2xl px-6">
        <div className="mx-auto mb-6">
          <img src={trinityLogo} alt="Trinity Hub" className="h-20 w-auto mx-auto" />
        </div>
        <h1 className="mb-4 text-5xl font-bold text-primary">Trinity Hub</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Plataforma de Criação de Planejamento Estratégico
        </p>
        <p className="text-foreground mb-8">
          Crie e gerencie seu planejamento estratégico de forma estruturada e eficiente.
        </p>
        <Button size="lg" onClick={() => navigate("/auth")}>
          Acessar Plataforma
        </Button>
      </div>
    </div>
  );
};

export default Index;
