import { AlertTriangle, Users, Target, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const painPoints = [
  {
    icon: Clock,
    text: "Acorda todo dia resolvendo problema em vez de fazer a empresa crescer?",
  },
  {
    icon: Users,
    text: "Toda reunião parece mais uma confusão do que alinhamento?",
  },
  {
    icon: Target,
    text: "Não sabe onde quer chegar, nem como?",
  },
  {
    icon: AlertTriangle,
    text: "Vive refém do operacional, sem tempo nem clareza?",
  },
];

const PainPointsSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Você tá passando por isso?
            </h2>
          </div>

          {/* Pain points grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {painPoints.map((point, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-destructive/20 bg-card"
              >
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 group-hover:bg-destructive/20 transition-colors">
                    <point.icon className="w-6 h-6 text-destructive" />
                  </div>
                  <p className="text-foreground text-lg">{point.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Statistics */}
          <div className="text-center">
            <p className="text-xl text-muted-foreground mb-2">
              Você não está sozinho.
            </p>
            <div className="inline-block bg-primary/10 rounded-xl px-8 py-4">
              <p className="text-2xl md:text-3xl font-bold text-primary">
                Mais de 87% das PMEs
              </p>
              <p className="text-muted-foreground">
                não têm um planejamento estratégico funcional.
              </p>
            </div>
            <p className="text-xl text-foreground mt-6 font-medium">
              E é exatamente por isso que o Trinity Hub existe.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PainPointsSection;
