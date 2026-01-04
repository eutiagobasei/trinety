import { Button } from "@/components/ui/button";
import { Gift, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OfferSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-3xl border border-primary/20 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-3">
                <Gift className="w-4 h-4" />
                OFERTA IRRESISTÍVEL
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground">
                Assine hoje com condições especiais
              </h2>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12 text-center">
              {/* Main offer */}
              <div className="mb-8">
                <div className="inline-block bg-success/10 rounded-2xl px-8 py-6 mb-6">
                  <p className="text-5xl md:text-6xl font-bold text-success mb-2">
                    40% OFF
                  </p>
                  <p className="text-lg text-muted-foreground">
                    no plano anual
                  </p>
                </div>

                {/* Bonus */}
                <div className="flex items-center justify-center gap-2 text-lg text-foreground">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-medium">+</span>
                  <span>
                    Ganhe uma{" "}
                    <span className="font-bold text-primary">
                      sessão estratégica gratuita
                    </span>{" "}
                    com um especialista Trinity
                  </span>
                </div>
              </div>

              {/* Urgency */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
                <Clock className="w-5 h-5" />
                <span>Promoção válida por tempo limitado</span>
              </div>

              {/* CTA */}
              <Button
                size="lg"
                className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/auth")}
              >
                Quero aproveitar essa oferta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferSection;
