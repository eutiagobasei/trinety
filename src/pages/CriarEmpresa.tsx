import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import trinityLogo from "@/assets/trinity-logo.png";

interface SubscriptionInfo {
  max_organizations: number;
  plan_name: string;
}

export default function CriarEmpresa() {
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [currentOrgCount, setCurrentOrgCount] = useState(0);
  const [checkingLimits, setCheckingLimits] = useState(true);
  
  const { user, organizations, refreshProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const checkLimits = async () => {
      if (!user) return;

      try {
        // Get user subscription with plan info
        const { data: subData } = await supabase
          .rpc("get_user_subscription", { _user_id: user.id });
        
        if (!subData || subData.length === 0) {
          // No subscription, redirect to choose plan
          navigate("/escolher-plano", { replace: true });
          return;
        }

        const sub = subData[0];
        setSubscription({
          max_organizations: sub.max_organizations,
          plan_name: sub.plan_name,
        });

        // Count owned organizations
        const { data: countData } = await supabase
          .rpc("count_user_organizations", { _user_id: user.id });
        
        setCurrentOrgCount(countData || 0);
      } catch (error) {
        console.error("Error checking limits:", error);
      } finally {
        setCheckingLimits(false);
      }
    };

    if (user) {
      checkLimits();
    }
  }, [user, navigate]);

  const canCreateMore = subscription 
    ? currentOrgCount < subscription.max_organizations 
    : false;

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

    if (!canCreateMore) {
      toast({
        title: "Limite atingido",
        description: `Seu plano permite até ${subscription?.max_organizations} empresa(s). Faça upgrade para criar mais.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert([{ name: companyName.trim(), code: "" }])
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as owner/admin
      const { error: memberError } = await supabase
        .from("user_organizations")
        .insert({
          user_id: user!.id,
          organization_id: org.id,
          role: "admin",
          is_owner: true,
        });

      if (memberError) throw memberError;

      // Set as active organization
      await supabase
        .from("profiles")
        .update({ active_organization_id: org.id })
        .eq("id", user!.id);

      // Refresh profile to get new org
      await refreshProfile();

      toast({
        title: "Empresa criada!",
        description: `${companyName} foi criada com sucesso.`,
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error creating company:", error);
      toast({
        title: "Erro ao criar empresa",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || checkingLimits) {
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
            {subscription && (
              <span className="block text-sm">
                Plano {subscription.plan_name}: {currentOrgCount}/{subscription.max_organizations} empresas
              </span>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!canCreateMore ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Você atingiu o limite de empresas do seu plano. 
                Faça upgrade para criar mais empresas.
              </AlertDescription>
            </Alert>
          ) : null}
          
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome da Empresa</Label>
              <Input
                id="company-name"
                type="text"
                placeholder="Minha Empresa Ltda"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading || !canCreateMore}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !canCreateMore}
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
