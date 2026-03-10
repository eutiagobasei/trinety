import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

interface PageContainerProps {
  children: ReactNode;
  title: string;
  description?: string;
  isLoading?: boolean;
  isSaving?: boolean;
  prevRoute?: string;
  nextRoute?: string;
  prevLabel?: string;
  nextLabel?: string;
  onNext?: () => void;
}

export function PageContainer({
  children,
  title,
  description,
  isLoading,
  isSaving,
  prevRoute,
  nextRoute,
  prevLabel = "Voltar",
  nextLabel = "Avançar",
  onNext,
}: PageContainerProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className="space-y-6">{children}</div>

      {/* Navigation Footer */}
      {(prevRoute || nextRoute) && (
        <div className="flex items-center justify-between pt-6 border-t">
          {prevRoute ? (
            <Button variant="outline" onClick={() => navigate(prevRoute)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {prevLabel}
            </Button>
          ) : (
            <div />
          )}
          {nextRoute && (
            <Button
              onClick={() => {
                if (onNext) onNext();
                navigate(nextRoute);
              }}
            >
              {nextLabel}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
