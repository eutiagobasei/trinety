import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useIndicadoresState } from "@/hooks/useIndicadoresState";
import { PageContainer } from "@/components/layout";
import { Plus } from "lucide-react";

export default function Indicadores() {
  const { indicators, updateIndicator, addIndicator, loading, saving } = useIndicadoresState();

  return (
    <PageContainer
      title="Indicadores Estratégicos (KPIs)"
      description="Crie os KPIs do seu negócio para 2026. Cada indicador pode ter metas mensais."
      isLoading={loading}
      isSaving={saving}
      prevRoute="/okrs"
      nextRoute="/plano-de-acao"
    >
      <div className="space-y-4">
        {indicators.map((kpi, i) => (
          <Card key={i} className="p-5">
            <h2 className="font-semibold text-foreground mb-4">Indicador {i + 1}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor={`nome-${i}`} className="text-sm">Nome</Label>
                <Input
                  id={`nome-${i}`}
                  placeholder="Ex: Taxa de Conversão"
                  value={kpi.nome}
                  onChange={(e) => updateIndicator(i, "nome", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor={`meta-${i}`} className="text-sm">Meta anual</Label>
                <Input
                  id={`meta-${i}`}
                  placeholder="Ex: 30%"
                  value={kpi.meta}
                  onChange={(e) => updateIndicator(i, "meta", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor={`origem-${i}`} className="text-sm">KR relacionado</Label>
                <Input
                  id={`origem-${i}`}
                  placeholder="Qual KR está ligado?"
                  value={kpi.origem}
                  onChange={(e) => updateIndicator(i, "origem", e.target.value)}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <Label htmlFor={`descricao-${i}`} className="text-sm">Descrição</Label>
                <Textarea
                  id={`descricao-${i}`}
                  placeholder="O que este indicador mede?"
                  value={kpi.descricao}
                  onChange={(e) => updateIndicator(i, "descricao", e.target.value)}
                  className="h-[38px] min-h-[38px]"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor={`mensal-${i}`} className="text-sm">Metas mensais</Label>
              <Textarea
                id={`mensal-${i}`}
                placeholder="- Jan: 5%&#10;- Fev: 10%&#10;- Mar: 15%"
                value={kpi.mensal}
                onChange={(e) => updateIndicator(i, "mensal", e.target.value)}
                className="min-h-[80px] resize-y"
              />
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={addIndicator} variant="outline" className="gap-2">
        <Plus className="h-4 w-4" />
        Adicionar Indicador
      </Button>
    </PageContainer>
  );
}
