import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function EscolherPlano() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth", { replace: true });
      } else {
        // Por enquanto, redireciona direto para criar-empresa
        // Sistema de planos sera implementado futuramente
        navigate("/criar-empresa", { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
