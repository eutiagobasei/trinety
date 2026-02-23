import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, ArrowLeft } from "lucide-react";
import trinityLogo from "@/assets/trinity-logo.png";

export default function CriarEmpresa() {
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, organizations, refreshProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome da sua empresa.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post("/organizations", { name: companyName.trim() });

      await refreshProfile();

      toast({
        title: "Empresa criada!",
        description: `${companyName} foi criada com sucesso.`,
      });

      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast({
        title: "Erro ao criar empresa",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasExistingOrgs = organizations.length > 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {hasExistingOrgs && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}

          <div className="mx-auto mb-4">
            <img src={trinityLogo} alt="Trinity Hub" className="h-16 w-auto" />
          </div>

          <div className="mx-auto mb-2 p-3 rounded-full bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>

          <CardTitle className="text-2xl">
            {hasExistingOrgs ? "Criar Nova Empresa" : "Criar sua Primeira Empresa"}
          </CardTitle>
          <CardDescription>
            Configure sua organização para começar o planejamento estratégico
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome da Empresa</Label>
              <Input
                id="company-name"
                type="text"
                placeholder="Minha Empresa Ltda"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Empresa"
              )}
            </Button>
          </form>

          {hasExistingOrgs && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Você pode alternar entre empresas no Dashboard.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
