import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import trinityLogo from "@/assets/trinity-logo.png";

export default function Dashboard() {
  const navigate = useNavigate();

  const [diagnosticProgress, setDiagnosticProgress] = useState(0);

  // Load real diagnostic progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const sessionId = localStorage.getItem("diagnostic_session_id");
        if (!sessionId) {
          setDiagnosticProgress(0);
          return;
        }

        const { data: diagnostic } = await supabase
          .from("diagnostics")
          .select("id, completed")
          .eq("session_id", sessionId)
          .single();

        if (!diagnostic) {
          setDiagnosticProgress(0);
          return;
        }

        if (diagnostic.completed) {
          setDiagnosticProgress(100);
          return;
        }

        // Calculate progress based on answers
        const { data: answers } = await supabase
          .from("diagnostic_answers")
          .select("*")
          .eq("diagnostic_id", diagnostic.id);

        // Total questions = 9 blocks × 3 questions = 27
        const totalQuestions = 27;
        const answeredCount = answers?.length || 0;
        const progress = Math.round((answeredCount / totalQuestions) * 100);
        
        setDiagnosticProgress(progress);
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    };

    loadProgress();
  }, []);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={trinityLogo} alt="Trinity Hub" className="h-10" />
            <div>
              <p className="text-sm text-muted-foreground">Planejamento Estratégico 2026</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Estratégico 2026
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo(a)! Aqui você acompanha e edita todas as etapas do seu Planejamento Estratégico 2026.
          </p>
        </div>

        {/* Card de Progresso do Diagnóstico */}
        {diagnosticProgress < 100 && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Complete seu Diagnóstico</CardTitle>
              <CardDescription>
                Finalize o diagnóstico para desbloquear todas as ferramentas estratégicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={diagnosticProgress} className="h-3 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                {diagnosticProgress}% concluído
              </p>
              <Button onClick={() => navigate("/diagnostico")}>
                Continuar Diagnóstico
              </Button>
            </CardContent>
          </Card>
        )}

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
