import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, Users, ArrowLeft } from "lucide-react";
import trinityLogo from "@/assets/trinity-logo.png";

export default function Onboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);
  
  const { user, organizations, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if not logged in
  if (!user) {
    navigate("/auth", { replace: true });
    return null;
  }

  const hasOrganizations = organizations.length > 0;

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
      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert([{ name: companyName.trim(), code: "" }])
        .select()
        .single();

      if (orgError) throw orgError;

      // Create user_organization entry with owner role
      const { error: userOrgError } = await supabase
        .from("user_organizations")
        .insert({
          user_id: user.id,
          organization_id: orgData.id,
          role: "admin",
          is_owner: true
        });

      if (userOrgError) throw userOrgError;

      // Set as active organization
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ active_organization_id: orgData.id })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Create default permissions for all modules
      const modules = [
        "diagnostico",
        "modelo-de-negocio",
        "mapa-de-empatia",
        "filosofia",
        "swot",
        "okrs",
        "indicadores",
        "plano-de-acao",
        "rotinas",
      ];

      const defaultPermissions = modules.flatMap((module) => [
        {
          organization_id: orgData.id,
          role: "gestor" as const,
          module,
          can_view: true,
          can_edit: true,
          can_manage: false,
        },
        {
          organization_id: orgData.id,
          role: "usuario" as const,
          module,
          can_view: true,
          can_edit: false,
          can_manage: false,
        },
      ]);

      await supabase.from("module_permissions").insert(defaultPermissions);

      await refreshProfile();

      toast({
        title: "Empresa criada!",
        description: `Código da empresa: ${orgData.code}`,
      });

      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      console.error("Error creating company:", error);
      toast({
        title: "Erro ao criar empresa",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyCode.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Digite o código da empresa.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Find organization by code
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("code", companyCode.trim().toUpperCase())
        .maybeSingle();

      if (orgError) throw orgError;

      if (!orgData) {
        toast({
          title: "Código inválido",
          description: "Nenhuma empresa encontrada com este código.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if user already belongs to this organization
      const existingOrg = organizations.find(o => o.organization_id === orgData.id);
      if (existingOrg) {
        toast({
          title: "Já é membro",
          description: "Você já pertence a esta empresa.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create user_organization entry
      const { error: userOrgError } = await supabase
        .from("user_organizations")
        .insert({
          user_id: user.id,
          organization_id: orgData.id,
          role: "usuario",
          is_owner: false
        });

      if (userOrgError) throw userOrgError;

      // Set as active organization
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ active_organization_id: orgData.id })
        .eq("id", user.id);

      if (profileError) throw profileError;

      await refreshProfile();

      toast({
        title: "Bem-vindo!",
        description: `Você entrou na empresa ${orgData.name}.`,
      });

      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      console.error("Error joining company:", error);
      toast({
        title: "Erro ao entrar na empresa",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // First time user - simplified view
  if (!hasOrganizations && !showJoinForm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img src={trinityLogo} alt="Trinity Hub" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl">Bem-vindo ao Trinity Hub!</CardTitle>
            <CardDescription>
              Crie sua primeira empresa para começar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nome da empresa</Label>
                <Input
                  id="company-name"
                  type="text"
                  placeholder="Minha Empresa Ltda"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Você será o administrador e receberá um código para convidar colaboradores.
              </p>
              <Button type="submit" className="w-full" disabled={isLoading}>
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
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowJoinForm(true)}
                className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline transition-colors"
              >
                Recebeu um código de convite? Entre aqui
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // First time user wanting to join
  if (!hasOrganizations && showJoinForm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={() => setShowJoinForm(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="mx-auto mb-4">
              <img src={trinityLogo} alt="Trinity Hub" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl">Entrar em uma Empresa</CardTitle>
            <CardDescription>
              Digite o código de convite recebido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinCompany} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-code">Código da empresa</Label>
                <Input
                  id="company-code"
                  type="text"
                  placeholder="ABC123"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  disabled={isLoading}
                  className="text-center text-lg font-mono tracking-widest"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Peça o código de 6 caracteres ao administrador da empresa.
              </p>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar na Empresa"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Existing user - tabs view
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="mx-auto mb-4">
            <img src={trinityLogo} alt="Trinity Hub" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl">Adicionar Empresa</CardTitle>
          <CardDescription>
            Crie uma nova empresa ou entre em uma existente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Criar
              </TabsTrigger>
              <TabsTrigger value="join" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Entrar com Código
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name-tabs">Nome da empresa</Label>
                  <Input
                    id="company-name-tabs"
                    type="text"
                    placeholder="Minha Empresa Ltda"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Você será o administrador e receberá um código para convidar colaboradores.
                </p>
                <Button type="submit" className="w-full" disabled={isLoading}>
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
            </TabsContent>
            
            <TabsContent value="join">
              <form onSubmit={handleJoinCompany} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-code-tabs">Código da empresa</Label>
                  <Input
                    id="company-code-tabs"
                    type="text"
                    placeholder="ABC123"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    disabled={isLoading}
                    className="text-center text-lg font-mono tracking-widest"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Peça o código de 6 caracteres ao administrador da empresa.
                </p>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar na Empresa"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
