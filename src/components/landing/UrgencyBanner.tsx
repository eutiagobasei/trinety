import { Bell, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const UrgencyBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 bg-destructive/10 border-y border-destructive/20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="flex items-center justify-center gap-2 text-destructive mb-4">
            <Bell className="w-6 h-6 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-wide">
              Último Aviso
            </span>
          </div>

          {/* Message */}
          <p className="text-xl md:text-2xl text-foreground font-semibold mb-4">
            O plano com <span className="text-destructive">40% OFF</span> + bônus estratégico{" "}
            <span className="text-destructive">expira em poucos dias.</span>
          </p>

          <p className="text-muted-foreground mb-6">
            Depois disso, só no próximo lote. Aproveite enquanto ainda está disponível.
          </p>

          {/* CTA */}
          <Button
            size="lg"
            className="gap-2"
            onClick={() => navigate("/auth")}
          >
            <Clock className="w-5 h-5" />
            Garantir minha vaga agora
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UrgencyBanner;
