import { MessageSquare, Lightbulb, BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "1",
    icon: MessageSquare,
    title: "Responda",
    description: "Você responde perguntas simples sobre sua empresa.",
  },
  {
    number: "2",
    icon: Lightbulb,
    title: "Monte",
    description: "O Trinity Hub te ajuda a montar o plano estratégico ideal.",
  },
  {
    number: "3",
    icon: BarChart3,
    title: "Acompanhe",
    description: "Você acompanha o progresso em um painel visual claro e direto.",
  },
  {
    number: "4",
    icon: TrendingUp,
    title: "Escale",
    description: "Revê, ajusta e escala com mais agilidade.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-accent/20 text-accent-foreground text-sm font-semibold mb-4">
              🧪 COMO FUNCIONA
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Como funciona na prática?
            </h2>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <Card
                key={index}
                className="relative group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-card border-border overflow-hidden"
              >
                {/* Step number background */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/5 rounded-full" />
                
                <CardContent className="p-6 relative">
                  {/* Step number */}
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent mt-[-120px]" />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
