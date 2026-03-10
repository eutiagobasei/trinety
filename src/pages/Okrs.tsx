import { useOkrsState } from "@/hooks/useOkrsState";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageContainer } from "@/components/layout";

export default function Okrs() {
  const { okrs, updateOkrs, isLoading, isSaving } = useOkrsState();

  return (
    <PageContainer
      title="OKRs — 2026"
      description="Preencha seu grande objetivo e os resultados-chave. Use tópicos (um por linha) nos KRs."
      isLoading={isLoading}
      isSaving={isSaving}
      prevRoute="/swot"
      nextRoute="/indicadores"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OBJETIVO */}
        <Card className="p-6">
          <Label htmlFor="objetivo" className="text-lg font-semibold mb-2 block">
            Objetivo
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            Qual é o grande objetivo que você quer alcançar em 2026?
          </p>
          <Textarea
            id="objetivo"
            className="min-h-[180px] resize-y"
            placeholder="Ex: Crescer com estrutura e previsibilidade."
            value={okrs.objetivo}
            onChange={(e) => updateOkrs("objetivo", e.target.value)}
          />
        </Card>

        {/* KRS */}
        <Card className="p-6">
          <Label htmlFor="krs" className="text-lg font-semibold mb-2 block">
            Resultados-Chave (KRs)
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            Como você vai medir o progresso? Liste os KRs mensuráveis.
          </p>
          <Textarea
            id="krs"
            className="min-h-[180px] resize-y"
            placeholder="- Aumentar X%&#10;- Reduzir Y&#10;- Implementar Z"
            value={okrs.krs}
            onChange={(e) => updateOkrs("krs", e.target.value)}
          />
        </Card>
      </div>
    </PageContainer>
  );
}
