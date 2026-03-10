import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFilosofiaState } from "@/hooks/useFilosofiaState";
import { PageContainer } from "@/components/layout";

export default function Filosofia() {
  const { filosofia, updateFilosofia, isLoading, isSaving } = useFilosofiaState();

  return (
    <PageContainer
      title="Filosofia do Negócio"
      description="Defina a essência estratégica: Visão, Missão e Valores. Use tópicos (um por linha) somente nos valores."
      isLoading={isLoading}
      isSaving={isSaving}
      prevRoute="/mapa-de-empatia"
      nextRoute="/swot"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <Label className="text-lg font-semibold mb-2 block">Visão</Label>
          <p className="text-xs text-muted-foreground mb-3">
            Onde você quer chegar? Que futuro deseja construir?
          </p>
          <Textarea
            className="min-h-[150px] resize-y"
            placeholder="Ex: Ser referência nacional em..."
            value={filosofia.visao}
            onChange={(e) => updateFilosofia("visao", e.target.value)}
          />
        </Card>

        <Card className="p-6">
          <Label className="text-lg font-semibold mb-2 block">Missão</Label>
          <p className="text-xs text-muted-foreground mb-3">
            O que você faz, para quem e por quê?
          </p>
          <Textarea
            className="min-h-[150px] resize-y"
            placeholder="Ex: Ajudar empresas a..."
            value={filosofia.missao}
            onChange={(e) => updateFilosofia("missao", e.target.value)}
          />
        </Card>

        <Card className="p-6">
          <Label className="text-lg font-semibold mb-2 block">Valores</Label>
          <p className="text-xs text-muted-foreground mb-3">
            Valores que guiam decisões. Um por linha.
          </p>
          <Textarea
            className="min-h-[150px] resize-y"
            placeholder="- Transparência&#10;- Agilidade&#10;- Respeito"
            value={filosofia.valores}
            onChange={(e) => updateFilosofia("valores", e.target.value)}
          />
        </Card>
      </div>
    </PageContainer>
  );
}
