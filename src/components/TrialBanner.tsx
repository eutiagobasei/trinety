import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";
import { Link } from "react-router-dom";

interface SubscriptionInfo {
  status: string;
  trial_ends_at: string | null;
  plan_name: string;
}

export function TrialBanner() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .rpc("get_user_subscription", { _user_id: user.id });

        if (data && data.length > 0) {
          const sub = data[0];
          setSubscription({
            status: sub.status,
            trial_ends_at: sub.trial_ends_at,
            plan_name: sub.plan_name,
          });

          if (sub.status === "trialing" && sub.trial_ends_at) {
            const endDate = new Date(sub.trial_ends_at);
            const now = new Date();
            const diffTime = endDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysLeft(Math.max(0, diffDays));
          }
        }
      } catch (error) {
        console.error("Error loading subscription:", error);
      }
    };

    loadSubscription();
  }, [user]);

  // Don't show if dismissed, not trialing, or no days left info
  if (dismissed || !subscription || subscription.status !== "trialing" || daysLeft === null) {
    return null;
  }

  const isUrgent = daysLeft <= 2;

  return (
    <div
      className={`relative flex items-center justify-center gap-3 px-4 py-2 text-sm ${
        isUrgent
          ? "bg-destructive text-destructive-foreground"
          : "bg-primary text-primary-foreground"
      }`}
    >
      <Clock className="h-4 w-4" />
      <span>
        {daysLeft === 0
          ? "Seu trial termina hoje!"
          : daysLeft === 1
          ? "Seu trial termina amanhã!"
          : `Seu trial termina em ${daysLeft} dias`}
      </span>
      <Button
        variant={isUrgent ? "secondary" : "outline"}
        size="sm"
        asChild
        className={isUrgent ? "" : "bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"}
      >
        <Link to="/escolher-plano">Fazer Upgrade</Link>
      </Button>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 opacity-70 hover:opacity-100"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
