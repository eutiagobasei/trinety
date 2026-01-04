import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            ✅ Está na hora de crescer com clareza
          </h2>

          {/* Description */}
          <p className="text-xl text-primary-foreground/90 mb-4">
            Você já tem o negócio. Agora falta o plano.
          </p>
          <p className="text-lg text-primary-foreground/80 mb-10">
            O Trinity Hub vai te dar o controle que você sempre quis, com a simplicidade que você precisa.
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-10 py-6 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 gap-2"
            onClick={() => navigate("/auth")}
          >
            Quero planejar e crescer com o Trinity Hub
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
