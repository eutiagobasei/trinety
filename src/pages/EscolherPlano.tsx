import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Sparkles } from "lucide-react";
import trinityLogo from "@/assets/trinity-logo.png";

interface Plan {
  id: string;
  name: string;
  slug: string;
  max_organizations: number;
  max_users_per_org: number;
  price_monthly: number;
  features: string[];
}

export default function EscolherPlano() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) {
        // Already has subscription, go to criar-empresa
        navigate("/criar-empresa", { replace: true });
        return;
      }
      
      // Load plans
      const { data: plansData, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly", { ascending: true });
      
      if (error) {
        console.error("Error loading plans:", error);
        toast({
          title: "Erro ao carregar planos",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        });
      } else if (plansData) {
        setPlans(plansData.map(p => ({
          ...p,
          features: Array.isArray(p.features) ? p.features : JSON.parse(p.features as string || '[]')
        })));
      }
      setIsLoading(false);
    };

    if (user) {
      checkExistingSubscription();
    }
  }, [user, navigate, toast]);

  const handleSelectPlan = async (planId: string) => {
    if (!user) return;
    
    setSelectedPlan(planId);
    setIsSubmitting(true);

    try {
      // Calculate trial end date (7 days from now)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      const { error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: "trialing",
          trial_ends_at: trialEndsAt.toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Plano selecionado!",
        description: "Seu trial de 7 dias começou. Agora crie sua empresa.",
      });

      navigate("/criar-empresa", { replace: true });
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Erro ao selecionar plano",
        description: "Tente novamente.",
        variant: "destructive",
      });
      setSelectedPlan(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <img src={trinityLogo} alt="Trinity Hub" className="h-16 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Escolha seu Plano
          </h1>
          <p className="text-muted-foreground text-lg">
            Comece com 7 dias grátis em qualquer plano. Cancele quando quiser.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isPopular = plan.slug === "pro";
            const isSelected = selectedPlan === plan.id;
            
            return (
              <Card
                key={plan.id}
                className={`relative transition-all ${
                  isPopular 
                    ? "border-primary shadow-lg scale-[1.02]" 
                    : "border-border"
                } ${isSelected ? "ring-2 ring-primary" : ""}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Mais Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">
                      {plan.price_monthly === 0 ? "Grátis" : `R$${plan.price_monthly}`}
                    </span>
                    {plan.price_monthly > 0 && (
                      <span className="text-muted-foreground">/mês</span>
                    )}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>
                        {plan.max_organizations === 1 
                          ? "1 empresa" 
                          : `Até ${plan.max_organizations} empresas`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>
                        {plan.max_users_per_org === -1 
                          ? "Usuários ilimitados" 
                          : `Até ${plan.max_users_per_org} usuários/empresa`}
                      </span>
                    </div>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isSubmitting}
                    className="w-full"
                    variant={isPopular ? "default" : "outline"}
                  >
                    {isSubmitting && isSelected ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ativando...
                      </>
                    ) : (
                      "Começar Trial Grátis"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer info */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Não precisa de cartão de crédito. 7 dias grátis para testar todas as funcionalidades.
        </p>
      </div>
    </div>
  );
}
