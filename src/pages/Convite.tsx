import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import trinityLogo from "@/assets/trinity-logo.png";

interface InviteInfo {
  id: string;
  organization_id: string;
  role: string;
  expires_at: string;
  organization_name: string;
}

export default function Convite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, signIn, signUp, refreshProfile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Auth form states
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Load invite info
  useEffect(() => {
    const loadInvite = async () => {
      if (!token) {
        setInviteError("Link de convite inválido.");
        setIsLoadingInvite(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("organization_invites")
          .select(`
            id,
            organization_id,
            role,
            expires_at,
            accepted_at,
            organization:organizations(name)
          `)
          .eq("token", token)
          .maybeSingle();

        if (error || !data) {
          setInviteError("Convite não encontrado ou já foi usado.");
          setIsLoadingInvite(false);
          return;
        }

        // Check if expired
        if (new Date(data.expires_at) < new Date()) {
          setInviteError("Este convite expirou. Solicite um novo convite.");
          setIsLoadingInvite(false);
          return;
        }

        // Check if already accepted
        if (data.accepted_at) {
          setInviteError("Este convite já foi aceito.");
          setIsLoadingInvite(false);
          return;
        }

        setInvite({
          id: data.id,
          organization_id: data.organization_id,
          role: data.role,
          expires_at: data.expires_at,
          organization_name: (data.organization as { name: string })?.name || "Empresa",
        });
      } catch (error) {
        console.error("Error loading invite:", error);
        setInviteError("Erro ao carregar convite.");
      } finally {
        setIsLoadingInvite(false);
      }
    };

    loadInvite();
  }, [token]);

  // Auto-accept if user is logged in
  useEffect(() => {
    if (user && invite && !accepted && !isAccepting) {
      acceptInvite();
    }
  }, [user, invite, accepted, isAccepting]);

  const acceptInvite = async () => {
    if (!user || !invite) return;

    setIsAccepting(true);

    try {
      // Check if user is already in this organization
      const { data: existing } = await supabase
        .from("user_organizations")
        .select("id")
        .eq("user_id", user.id)
        .eq("organization_id", invite.organization_id)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Você já faz parte desta empresa",
          description: "Redirecionando para o Dashboard...",
        });
        
        // Set as active org and redirect
        await supabase
          .from("profiles")
          .update({ active_organization_id: invite.organization_id })
          .eq("id", user.id);
        
        await refreshProfile();
        navigate("/dashboard", { replace: true });
        return;
      }

      // Add user to organization
      const { error: joinError } = await supabase
        .from("user_organizations")
        .insert({
          user_id: user.id,
          organization_id: invite.organization_id,
          role: invite.role as "admin" | "gestor" | "usuario",
          is_owner: false,
        });

      if (joinError) throw joinError;

      // Mark invite as accepted
      await supabase
        .from("organization_invites")
        .update({ 
          accepted_at: new Date().toISOString(),
          accepted_by: user.id 
        })
        .eq("id", invite.id);

      // Set as active organization
      await supabase
        .from("profiles")
        .update({ active_organization_id: invite.organization_id })
        .eq("id", user.id);

      await refreshProfile();

      setAccepted(true);
      toast({
        title: "Convite aceito!",
        description: `Você agora faz parte de ${invite.organization_name}.`,
      });

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);
    } catch (error) {
      console.error("Error accepting invite:", error);
      toast({
        title: "Erro ao aceitar convite",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email e senha.",
        variant: "destructive",
      });
      return;
    }

    setIsAuthLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsAuthLoading(false);

    if (error) {
      toast({
        title: "Erro ao entrar",
        description: error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos." 
          : error.message,
        variant: "destructive",
      });
    }
    // acceptInvite will be called by useEffect when user is set
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword || !signupName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        title: "Senha fraca",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsAuthLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setIsAuthLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já está em uso. Tente fazer login.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao cadastrar",
          description: error.message,
          variant: "destructive",
        });
      }
    }
    // acceptInvite will be called by useEffect when user is set
  };

  // Loading state
  if (isLoadingInvite || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (inviteError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img src={trinityLogo} alt="Trinity Hub" className="h-16 w-auto" />
            </div>
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Convite Inválido</CardTitle>
            <CardDescription>{inviteError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/">Ir para a página inicial</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (accepted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img src={trinityLogo} alt="Trinity Hub" className="h-16 w-auto" />
            </div>
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Convite Aceito!</CardTitle>
            <CardDescription>
              Você agora faz parte de {invite?.organization_name}. Redirecionando...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Accepting state (user logged in)
  if (user && isAccepting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img src={trinityLogo} alt="Trinity Hub" className="h-16 w-auto" />
            </div>
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <CardTitle>Aceitando convite...</CardTitle>
            <CardDescription>
              Adicionando você à {invite?.organization_name}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Auth form (user not logged in)
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img src={trinityLogo} alt="Trinity Hub" className="h-16 w-auto" />
          </div>
          
          <div className="mx-auto mb-2 p-3 rounded-full bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          
          <CardTitle className="text-xl">Você foi convidado!</CardTitle>
          <CardDescription>
            Para entrar em <strong>{invite?.organization_name}</strong>,
            faça login ou crie sua conta.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Alert className="mb-4">
            <Building2 className="h-4 w-4" />
            <AlertDescription>
              Após entrar, você será adicionado automaticamente à empresa como <strong>{invite?.role}</strong>.
            </AlertDescription>
          </Alert>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={isAuthLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isAuthLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isAuthLoading}>
                  {isAuthLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar e Aceitar Convite"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome completo</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    disabled={isAuthLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    disabled={isAuthLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    disabled={isAuthLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirmar senha</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    disabled={isAuthLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isAuthLoading}>
                  {isAuthLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar Conta e Aceitar"
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
