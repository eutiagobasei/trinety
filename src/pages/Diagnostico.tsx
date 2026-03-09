import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDiagnosticState } from "@/hooks/useDiagnosticState";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import {
  Loader2,
  Sparkles,
  Building2,
  Users,
  Gem,
  MessageSquare,
  Heart,
  Package,
  Settings,
  Zap,
  AlertTriangle,
  Rocket,
  Check,
  FileText,
  Target,
  BarChart3,
  ListChecks,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import trinityLogo from "@/assets/trinity-logo.png";
import { cn } from "@/lib/utils";

// Icons for each block
const blockIcons = [
  Building2,     // Sobre o Negocio
  Users,         // Cliente Ideal
  Gem,           // Proposta de Valor
  MessageSquare, // Canais e Relacionamento
  Heart,         // Experiencia do Cliente
  Package,       // Produtos e Receita
  Settings,      // Operacao e Processos
  Zap,           // Forcas Internas
  AlertTriangle, // Gargalos e Fraquezas
  Rocket         // Visao de Futuro
];

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const block = questionBlocks[currentBlock];
  const BlockIcon = blockIcons[currentBlock];

  const handleAnswerChange = (index: number, value: string) => {
    updateAnswer(currentBlock, index, value);
  };

  const isBlockComplete = () => {
    return block.questions.every((_, index) => {
      const key = `${currentBlock}-${index}`;
      return answers[key] && answers[key].trim().length > 0;
    });
  };

  // Check if specific block is complete
  const isBlockIndexComplete = useCallback((blockIndex: number) => {
    return questionBlocks[blockIndex].questions.every((_, qIndex) => {
      const key = `${blockIndex}-${qIndex}`;
      return answers[key] && answers[key].trim().length > 0;
    });
  }, [answers]);

  // Count total answered questions
  const answeredCount = useMemo(() => {
    let count = 0;
    questionBlocks.forEach((b, blockIndex) => {
      b.questions.forEach((_, qIndex) => {
        const key = `${blockIndex}-${qIndex}`;
        if (answers[key] && answers[key].trim().length > 0) {
          count++;
        }
      });
    });
    return count;
  }, [answers]);

  const totalQuestions = questionBlocks.reduce((acc, b) => acc + b.questions.length, 0);

  // Check if ALL blocks are complete
  const isAllComplete = useMemo(() => {
    return questionBlocks.every((b, blockIndex) =>
      b.questions.every((_, qIndex) => {
        const key = `${blockIndex}-${qIndex}`;
        return answers[key] && answers[key].trim().length > 0;
      })
    );
  }, [answers]);

  const changeBlock = useCallback((newBlock: number) => {
    if (newBlock === currentBlock || newBlock < 0 || newBlock >= questionBlocks.length) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentBlock(newBlock);
      setIsTransitioning(false);
      // Auto-scroll to top of content
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }, 150);
  }, [currentBlock]);

  const handleNext = () => {
    if (currentBlock < questionBlocks.length - 1) {
      changeBlock(currentBlock + 1);
    } else {
      finalizeDiagnostic();
    }
  };

  const handleBack = () => {
    if (currentBlock > 0) {
      changeBlock(currentBlock - 1);
    }
  };

  // Keyboard shortcut: Ctrl+Enter to advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isBlockComplete()) {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentBlock, answers]);

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
      {/* Confetti CSS Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                backgroundColor: ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'][i % 5],
                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                animation: `confetti-fall ${2 + Math.random() * 2}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(139, 92, 246, 0);
          }
        }
      `}</style>

      {/* Header - Simplified */}
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
          {/* Saving indicator */}
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Salvando...
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Horizontal Stepper Navigation */}
        <div className="max-w-4xl mx-auto mb-8 overflow-x-auto pb-2">
          <div className="flex items-center justify-center min-w-max px-4">
            {questionBlocks.map((b, index) => {
              const isComplete = isBlockIndexComplete(index);
              const isCurrent = index === currentBlock;
              const StepIcon = blockIcons[index];

              return (
                <div key={index} className="flex items-center">
                  {/* Step Circle */}
                  <button
                    onClick={() => changeBlock(index)}
                    className={cn(
                      "relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 font-semibold text-sm",
                      isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/30",
                      isComplete && !isCurrent && "bg-green-500 text-white hover:bg-green-600",
                      !isComplete && !isCurrent && "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                    title={b.title}
                  >
                    {isComplete && !isCurrent ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </button>

                  {/* Connector Line */}
                  {index < questionBlocks.length - 1 && (
                    <div
                      className={cn(
                        "w-6 sm:w-10 h-1 mx-1 rounded-full transition-colors duration-200",
                        isComplete ? "bg-green-500" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {/* Current block title */}
          <p className="text-center mt-3 text-sm font-medium text-muted-foreground">
            {block.title}
          </p>
        </div>

        {/* Segmented Progress Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-3">
            <span className="font-medium">Bloco {currentBlock + 1} de {questionBlocks.length}</span>
            <span className="font-medium">{answeredCount}/{totalQuestions} perguntas</span>
          </div>
          {/* Segmented bar */}
          <div className="flex gap-1 h-2">
            {questionBlocks.map((_, index) => {
              const isComplete = isBlockIndexComplete(index);
              const isCurrent = index === currentBlock;
              return (
                <div
                  key={index}
                  className={cn(
                    "flex-1 rounded-full transition-colors duration-300",
                    isComplete ? "bg-green-500" : isCurrent ? "bg-primary" : "bg-muted"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Block Title and Description with Icon */}
        <div
          className={cn(
            "max-w-3xl mx-auto mb-8 bg-card p-6 rounded-xl border border-border shadow-sm transition-all duration-300",
            isTransitioning && "opacity-0 translate-x-4"
          )}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BlockIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">{block.title}</h2>
              <p className="text-muted-foreground text-base sm:text-lg">{block.description}</p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div
          className={cn(
            "max-w-3xl mx-auto space-y-6 transition-all duration-300",
            isTransitioning && "opacity-0 translate-x-4"
          )}
        >
          {block.questions.map((q, index) => {
            const key = `${currentBlock}-${index}`;
            const hasAnswer = answers[key] && answers[key].trim().length > 0;
            const charCount = (answers[key] || '').length;

            return (
              <div
                key={key}
                className={cn(
                  "bg-card p-6 rounded-xl border shadow-sm transition-all duration-300",
                  hasAnswer
                    ? "border-green-500/50 bg-green-50/30 dark:bg-green-950/10"
                    : "border-border"
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Label htmlFor={key} className="text-card-foreground font-medium text-lg block flex-1">
                    {index + 1}. {q}
                  </Label>
                  {hasAnswer && (
                    <div className="flex-shrink-0 p-1 bg-green-500 rounded-full">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* AI-friendly instruction */}
                <p className="text-xs text-muted-foreground mb-3">
                  *Responda em topicos, colocando cada ideia em uma nova linha.*
                </p>

                <div className="relative">
                  <Textarea
                    id={key}
                    value={answers[key] || ""}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className={cn(
                      "min-h-[120px] resize-y pr-16 transition-colors",
                      hasAnswer && "border-green-500/30 focus:border-green-500"
                    )}
                    placeholder="Ex: Nosso diferencial e o atendimento personalizado..."
                  />
                  {/* Character counter */}
                  <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                    {charCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons */}
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

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Ctrl+Enter para avancar
            </span>
            <Button
              onClick={handleNext}
              disabled={!isBlockComplete()}
              size="lg"
              className="px-8"
            >
              {currentBlock === questionBlocks.length - 1 ? "Concluir Bloco" : "Proximo Bloco"}
            </Button>
          </div>
        </div>

        {/* Generate Planning Button - appears when all blocks are complete */}
        {isAllComplete && (
          <div className="max-w-3xl mx-auto mt-8">
            <div
              className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-purple-500/10 border-2 border-primary/40 rounded-2xl p-8 text-center"
              style={!loading ? { animation: 'pulse-border 2s ease-in-out infinite' } : {}}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground">
                  Diagnostico Completo!
                </h3>
              </div>

              <p className="text-muted-foreground mb-6 text-lg">
                Todas as {totalQuestions} perguntas foram respondidas. Agora voce pode gerar seu planejamento estrategico completo usando inteligencia artificial.
              </p>

              {/* Modules that will be generated */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: FileText, label: "Canvas" },
                  { icon: Users, label: "Mapa de Empatia" },
                  { icon: Target, label: "SWOT" },
                  { icon: Heart, label: "Filosofia" },
                  { icon: Rocket, label: "OKRs" },
                  { icon: BarChart3, label: "Indicadores" },
                  { icon: ListChecks, label: "Plano de Acao" },
                  { icon: Calendar, label: "Rotinas" }
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 p-2 bg-background/50 rounded-lg text-sm">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => {
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 3000);
                  finalizeDiagnostic();
                }}
                disabled={loading}
                size="lg"
                className={cn(
                  "px-12 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 transition-all",
                  !loading && "hover:scale-105"
                )}
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
