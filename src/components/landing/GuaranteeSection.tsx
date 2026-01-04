import { Shield, CheckCircle } from "lucide-react";

const GuaranteeSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Shield icon */}
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-success" />
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            🛡️ Garantia de Tranquilidade
          </h2>

          {/* Description */}
          <p className="text-xl text-muted-foreground mb-6">
            Experimente{" "}
            <span className="font-bold text-foreground">7 dias grátis.</span>
          </p>

          {/* Benefits */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-foreground">Cancele com 1 clique</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-foreground">Sem letras miúdas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-foreground">Sem riscos</span>
            </div>
          </div>

          <p className="text-muted-foreground">
            Se não fizer sentido, cancele com 1 clique. Simples assim.
          </p>
        </div>
      </div>
    </section>
  );
};

export default GuaranteeSection;
