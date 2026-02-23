import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, LogOut, Crown, Building2 } from "lucide-react";
import trinityLogo from "@/assets/trinity-logo.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const { organization, role, signOut, organizations, isSuperAdmin, user } = useAuth();

  // Redirect to criar-empresa if no organization
  useEffect(() => {
    if (organizations.length === 0) {
      navigate("/criar-empresa", { replace: true });
    }
  }, [organizations, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const sections = [
    {
      title: "Diagnóstico Inicial",
      route: "/diagnostico",
      desc: "Suas respostas gerarão automaticamente todas as ferramentas estratégicas.",
      highlight: true
    },
    {
      title: "Modelo de Negócio (Canvas)",
      route: "/modelo-de-negocio",
      desc: "Veja e edite o Canvas gerado a partir do diagnóstico."
    },
    {
      title: "Mapa de Empatia",
      route: "/mapa-de-empatia",
      desc: "Entenda profundamente seu cliente ideal."
    },
    {
      title: "Filosofia (Visão, Missão, Valores)",
      route: "/filosofia",
      desc: "A essência da estratégia do seu negócio."
    },
    {
      title: "SWOT",
      route: "/swot",
      desc: "Forças, Fraquezas, Oportunidades e Ameaças."
    },
    {
      title: "OKRs",
      route: "/okrs",
      desc: "Objetivos e Resultados-Chave para 2026."
    },
    {
      title: "Indicadores",
      route: "/indicadores",
      desc: "Construção dos KPIs e metas mensais."
    },
    {
      title: "Plano de Ação",
      route: "/plano-de-acao",
      desc: "Ações distribuídas e organizadas automaticamente."
    },
    {
      title: "Rotinas de Gestão",
      route: "/rotinas",
      desc: "Cadência e rituais para sustentar o planejamento."
    }
  ];

  if (!organization) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={trinityLogo} alt="Trinity Hub" className="h-10" />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">{organization.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                <Crown className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate("/criar-empresa")}>
              Nova Empresa
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Estratégico 2026
          </h1>
          <p className="text-muted-foreground">
            Olá, {user?.fullName || user?.email}! Aqui você acompanha e edita todas as etapas do seu Planejamento Estratégico.
          </p>
        </div>

        {/* Card de Início */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Comece pelo Diagnóstico</CardTitle>
            <CardDescription>
              Responda as perguntas do diagnóstico para gerar automaticamente todas as ferramentas estratégicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/diagnostico")}>
              Iniciar Diagnóstico
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Grid de Ferramentas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sections.map((item, index) => (
            <Card
              key={index}
              onClick={() => navigate(item.route)}
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                item.highlight ? "border-primary/50 bg-primary/5" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {item.title}
                  <ArrowRight className="h-5 w-5 text-primary" />
                </CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-primary">
                  Acessar →
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
