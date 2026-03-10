import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  ClipboardList,
  Grid3X3,
  Users,
  Compass,
  Target,
  TrendingUp,
  BarChart3,
  ListTodo,
  CalendarClock,
  Sparkles
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { organization, organizations, user } = useAuth();

  useEffect(() => {
    if (organizations.length === 0) {
      navigate("/criar-empresa", { replace: true });
    }
  }, [organizations, navigate]);

  const sections = [
    {
      title: "Diagnóstico Inicial",
      route: "/diagnostico",
      desc: "Suas respostas gerarão automaticamente todas as ferramentas estratégicas.",
      icon: ClipboardList,
      highlight: true,
      category: "start"
    },
    {
      title: "Modelo de Negócio",
      route: "/modelo-de-negocio",
      desc: "Veja e edite o Canvas gerado a partir do diagnóstico.",
      icon: Grid3X3,
      category: "planning"
    },
    {
      title: "Mapa de Empatia",
      route: "/mapa-de-empatia",
      desc: "Entenda profundamente seu cliente ideal.",
      icon: Users,
      category: "planning"
    },
    {
      title: "Filosofia",
      route: "/filosofia",
      desc: "Visão, Missão, Valores - a essência da estratégia.",
      icon: Compass,
      category: "planning"
    },
    {
      title: "SWOT",
      route: "/swot",
      desc: "Forças, Fraquezas, Oportunidades e Ameaças.",
      icon: Target,
      category: "planning"
    },
    {
      title: "OKRs",
      route: "/okrs",
      desc: "Objetivos e Resultados-Chave para 2026.",
      icon: TrendingUp,
      category: "execution"
    },
    {
      title: "Indicadores",
      route: "/indicadores",
      desc: "Construção dos KPIs e metas mensais.",
      icon: BarChart3,
      category: "execution"
    },
    {
      title: "Plano de Ação",
      route: "/plano-de-acao",
      desc: "Ações distribuídas e organizadas automaticamente.",
      icon: ListTodo,
      category: "execution"
    },
    {
      title: "Rotinas de Gestão",
      route: "/rotinas",
      desc: "Cadência e rituais para sustentar o planejamento.",
      icon: CalendarClock,
      category: "execution"
    }
  ];

  if (!organization) {
    return null;
  }

  const planningTools = sections.filter(s => s.category === "planning");
  const executionTools = sections.filter(s => s.category === "execution");

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Dashboard Estratégico 2026
        </h1>
        <p className="text-muted-foreground">
          Olá, {user?.fullName?.split(" ")[0] || ""}! Acompanhe e edite todas as etapas do seu Planejamento Estratégico.
        </p>
      </div>

      {/* Call to Action - Diagnóstico */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Comece pelo Diagnóstico</CardTitle>
              <CardDescription>
                Responda as perguntas para gerar automaticamente todas as ferramentas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/diagnostico")} size="lg">
            Iniciar Diagnóstico
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Planning Tools Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Planejamento Estratégico</h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {planningTools.map((item) => (
            <Card
              key={item.route}
              onClick={() => navigate(item.route)}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="text-base mt-3">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm line-clamp-2">
                  {item.desc}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Execution Tools Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Execução</h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {executionTools.map((item) => (
            <Card
              key={item.route}
              onClick={() => navigate(item.route)}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="text-base mt-3">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm line-clamp-2">
                  {item.desc}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
