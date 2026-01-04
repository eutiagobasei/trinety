import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Plataforma de Planejamento Estratégico
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
            Sua empresa não pode mais{" "}
            <span className="text-primary">crescer no improviso.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 animate-fade-in">
            Crie um planejamento estratégico claro, prático e que realmente funciona com o Trinity Hub.
          </p>

          {/* Supporting text */}
          <p className="text-lg text-muted-foreground/80 mb-10 max-w-2xl mx-auto animate-fade-in">
            Transforme o caos operacional em direção estratégica. O Trinity Hub é a plataforma que coloca você no controle do crescimento da sua empresa, mesmo que você nunca tenha feito um planejamento na vida.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in">
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/auth")}
            >
              Quero planejar e crescer com o Trinity Hub
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 gap-2"
            >
              <Play className="w-5 h-5" />
              Ver como funciona
            </Button>
          </div>

          {/* Video/Dashboard placeholder */}
          <div className="relative max-w-3xl mx-auto animate-fade-in">
            <div className="aspect-video rounded-xl bg-gradient-to-br from-card to-muted border border-border shadow-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4 mx-auto cursor-pointer hover:bg-primary/30 transition-colors">
                    <Play className="w-8 h-8 text-primary ml-1" />
                  </div>
                  <p className="text-muted-foreground">
                    Veja como pequenas e médias empresas estão saindo da bagunça e alcançando resultados com o Trinity Hub
                  </p>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-success/20 rounded-lg blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/20 rounded-lg blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
