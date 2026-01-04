import { CheckCircle } from "lucide-react";

const benefits = [
  "Criar metas claras e acionáveis",
  "Desenhar planos de ação simples e eficientes",
  "Acompanhar o progresso em tempo real",
  "Alinhar a equipe e delegar com clareza",
  "Tomar decisões com mais confiança",
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              🔥 APRESENTANDO
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-6">
            O Trinity Hub
          </h2>

          {/* Description */}
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Uma plataforma estratégica, intuitiva e completa, feita para donos de pequenas e médias empresas que querem crescer com{" "}
            <span className="text-foreground font-medium">método, clareza e segurança.</span>
          </p>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-card to-muted/50 rounded-2xl border border-border p-8 md:p-12">
            <p className="text-lg text-muted-foreground mb-8 text-center">
              Com o Trinity Hub, você vai:
            </p>
            <div className="space-y-4 max-w-md mx-auto">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center shrink-0 group-hover:bg-success/30 transition-colors">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <p className="text-lg text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-8 text-lg">
              Tudo isso em um sistema{" "}
              <span className="text-foreground font-medium">visual, fácil de usar e sem complicação.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
