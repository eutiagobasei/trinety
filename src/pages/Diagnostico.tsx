import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useDiagnosticState } from "@/hooks/useDiagnosticState";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import trinityLogo from "@/assets/trinity-logo.png";

// --- PERGUNTAS DO DIAGNOSTICO (organizadas em blocos de ate 3) ---
const questionBlocks = [
  {
    title: "Sobre o Negocio",
    description:
      "Antes de tudo, precisamos entender o que sua empresa faz. Essa resposta vai alimentar todas as etapas do planejamento.",
    questions: [
      "O que sua empresa faz hoje? Descreva suas atividades principais, servicos, produtos e como voce atende seus clientes.",
      "Qual e o seu core business — a atividade central que sustenta o negocio?",
      "Qual e a principal transformacao que voce entrega para seus clientes?"
    ]
  },
  {
    title: "Cliente Ideal",
    description:
      "Defina quem realmente e o cliente ideal do seu negocio para 2026.",
    questions: [
      "Quem e o cliente que mais traz lucro e menos dor de cabeca?",
      "Quem voces nunca mais querem atender?",
      "Quem voces querem atrair em 2026?"
    ]
  },
  {
    title: "Proposta de Valor",
    description:
      "Agora vamos entender o que torna o seu negocio realmente diferente.",
    questions: [
      "O que voces entregam que ninguem mais entrega?",
      "Qual frase representa o impacto que voces geram?",
      "Que problema grave voces resolvem melhor que os concorrentes?"
    ]
  },
  {
    title: "Canais e Relacionamento",
    description:
      "Como seus clientes encontram voces e como preferem se relacionar.",
    questions: [
      "Onde seus melhores clientes encontram voces hoje?",
      "Onde voces deveriam aparecer em 2026?",
      "Como o cliente ideal prefere ser atendido?"
    ]
  },
  {
    title: "Experiencia do Cliente",
    description:
      "Agora vamos falar da experiencia e da jornada do cliente dentro do seu negocio.",
    questions: [
      "Como voces querem que o cliente se sinta apos contratar voces?",
      "Qual transformacao ele precisa perceber no primeiro mes?",
      "O que e inegociavel na entrega de voces?"
    ]
  },
  {
    title: "Produtos e Receita",
    description:
      "Entenda o que realmente gera receita e lucro no seu negocio.",
    questions: [
      "Quais produtos/servicos sao mais lucrativos hoje?",
      "Qual servico deveria ser vendido mais em 2026?",
      "Que produto/servico poderia ser descontinuado?"
    ]
  },
  {
    title: "Operacao e Processos",
    description:
      "Mapeie a estrutura que sustenta a entrega do seu negocio.",
    questions: [
      "O que nao pode falhar na operacao?",
      "Quais processos mais travam o andamento do negocio?",
      "Onde ha mais retrabalho hoje?"
    ]
  },
  {
    title: "Forcas Internas",
    description:
      "Aqui entendemos os pontos fortes, competencias e recursos do negocio.",
    questions: [
      "Quais habilidades unicas o time possui?",
      "Que diferenciais reais sustentam o negocio hoje?",
      "Quais recursos tornam voces melhores que a media do mercado?"
    ]
  },
  {
    title: "Gargalos e Fraquezas",
    description:
      "Agora vamos olhar para pontos sensiveis e riscos do negocio.",
    questions: [
      "Qual fraqueza mais ameaca o crescimento em 2026?",
      "Qual risco poderia prejudicar o resultado do ano?",
      "O que consome mais tempo, dinheiro ou energia?"
    ]
  },
  {
    title: "Visao de Futuro (2026)",
    description:
      "Defina a direcao clara do negocio para o proximo ano.",
    questions: [
      "Qual e o principal objetivo estrategico para 2026?",
      "Que mudanca interna e necessaria para atingir esse objetivo?",
      "Qual seria o melhor resultado possivel ao fim do ano?"
    ]
  }
];

export default function Diagnostico() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { answers, updateAnswer, completeDiagnostic, isLoading, isSaving } = useDiagnosticState();
  const { organization } = useAuth();

  const [currentBlock, setCurrentBlock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState("");

  const block = questionBlocks[currentBlock];

  const handleAnswerChange = (index: number, value: string) => {
    updateAnswer(currentBlock, index, value);
  };

  const isBlockComplete = () => {
    return block.questions.every((_, index) => {
      const key = `${currentBlock}-${index}`;
      return answers[key] && answers[key].trim().length > 0;
    });
  };

  // Check if ALL blocks are complete
  const isAllComplete = useMemo(() => {
    return questionBlocks.every((b, blockIndex) =>
      b.questions.every((_, qIndex) => {
        const key = `${blockIndex}-${qIndex}`;
        return answers[key] && answers[key].trim().length > 0;
      })
    );
  }, [answers]);

  const handleNext = () => {
    if (currentBlock < questionBlocks.length - 1) {
      setCurrentBlock(currentBlock + 1);
    } else {
      finalizeDiagnostic();
    }
  };

  const handleBack = () => {
    if (currentBlock > 0) {
      setCurrentBlock(currentBlock - 1);
    }
  };

  const finalizeDiagnostic = async () => {
    if (!organization?.id) {
      toast({
        title: "Erro",
        description: "Organizacao nao encontrada. Por favor, recarregue a pagina.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setGenerationStep("Salvando diagnostico...");

    await completeDiagnostic();

    console.log('Calling generate-strategic-plan with organization_id:', organization.id);

    setGenerationStep("Gerando planejamento estrategico com IA...");

    try {
      const data = await apiClient.post<{ success: boolean; error?: string }>(
        `/organizations/${organization.id}/strategic-planning/generate`
      );

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao gerar planejamento');
      }

      toast({
        title: "Planejamento gerado!",
        description: "Seu planejamento estrategico foi criado com sucesso.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error('Error generating strategic plan:', error);
      toast({
        title: "Erro na geracao",
        description: error instanceof Error ? error.message : "Erro ao gerar planejamento. Tente novamente.",
        variant: "destructive"
      });
      setLoading(false);
      setGenerationStep("");
    }
  };

  const progress = ((currentBlock + 1) / questionBlocks.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando diagnostico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Dashboard
            </Button>
            <img src={trinityLogo} alt="Trinity Hub" className="h-10" />
            <div>
              <p className="text-sm text-muted-foreground">Diagnostico Estrategico</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Navegacao por Blocos */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {questionBlocks.map((b, index) => {
              const isComplete = b.questions.every((_, qIndex) => {
                const key = `${index}-${qIndex}`;
                return answers[key] && answers[key].trim().length > 0;
              });
              const isCurrent = index === currentBlock;

              return (
                <button
                  key={index}
                  onClick={() => setCurrentBlock(index)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isComplete
                        ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {index + 1}. {b.title}
                  {isComplete && !isCurrent && " OK"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Bloco {currentBlock + 1} de {questionBlocks.length}</span>
            <div className="flex items-center gap-2">
              <span>{Math.round(progress)}% completo</span>
              {isSaving && (
                <span className="text-xs flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Salvando...
                </span>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Titulo e descricao */}
        <div className="max-w-3xl mx-auto mb-8 bg-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-3xl font-bold text-card-foreground mb-2">{block.title}</h2>
          <p className="text-muted-foreground text-lg">{block.description}</p>
        </div>

        {/* Perguntas */}
        <div className="max-w-3xl mx-auto space-y-6">
          {block.questions.map((q, index) => {
            const key = `${currentBlock}-${index}`;
            return (
              <div key={index} className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <Label htmlFor={key} className="text-card-foreground font-medium text-lg mb-2 block">
                  {index + 1}. {q}
                </Label>

                {/* Instrucao de resposta IA-friendly */}
                <p className="text-xs text-muted-foreground mb-3">
                  *Responda em topicos, colocando cada ideia em uma nova linha.*
                </p>

                <Textarea
                  id={key}
                  value={answers[key] || ""}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="min-h-[120px] resize-y"
                  placeholder={"- ponto 1\n- ponto 2\n- ponto 3"}
                />
            </div>
            );
          })}
        </div>

        {/* Botoes de Navegacao */}
        <div className="max-w-3xl mx-auto flex justify-between mt-10 gap-4">
          <Button
            onClick={handleBack}
            disabled={currentBlock === 0}
            variant="outline"
            size="lg"
            className="px-8"
          >
            Voltar
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isBlockComplete()}
            size="lg"
            className="px-8"
          >
            {currentBlock === questionBlocks.length - 1 ? "Concluir Bloco" : "Proximo Bloco"}
          </Button>
        </div>

        {/* Botao de Gerar Planejamento - aparece quando todos os blocos estao completos */}
        {isAllComplete && (
          <div className="max-w-3xl mx-auto mt-8">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-card-foreground">
                  Diagnostico Completo!
                </h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Todas as 30 perguntas foram respondidas. Agora voce pode gerar seu planejamento estrategico completo usando inteligencia artificial.
              </p>
              <Button
                onClick={finalizeDiagnostic}
                disabled={loading}
                size="lg"
                className="px-10 py-6 text-lg font-semibold bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {generationStep || "Gerando planejamento..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5" />
                    Gerar Planejamento Estrategico com IA
                  </span>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Serao gerados: Canvas, Mapa de Empatia, SWOT, Filosofia, OKRs, Indicadores, Plano de Acao e Rotinas
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
