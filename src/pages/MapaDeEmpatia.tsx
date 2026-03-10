import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useEmpathyMapState } from "@/hooks/useEmpathyMapState";
import { PageContainer } from "@/components/layout";

export default function MapaDeEmpatia() {
  const { empathyMap, updateField, isLoading, isSaving } = useEmpathyMapState();

  return (
    <PageContainer
      title="Mapa de Empatia"
      description="Entenda profundamente seu cliente ideal preenchendo cada área do mapa."
      isLoading={isLoading}
      isSaving={isSaving}
      prevRoute="/modelo-de-negocio"
      nextRoute="/filosofia"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <Label className="text-base font-semibold mb-1 block">O que vê?</Label>
          <p className="text-xs text-muted-foreground mb-3">Ambiente, amigos, ofertas do mercado</p>
          <Textarea
            className="min-h-[120px] resize-y"
            placeholder="- O que ele vê no ambiente?&#10;- Quais ofertas recebe?"
            value={empathyMap.oQueVe}
            onChange={(e) => updateField("oQueVe", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label className="text-base font-semibold mb-1 block">O que ouve?</Label>
          <p className="text-xs text-muted-foreground mb-3">Amigos, família, influenciadores</p>
          <Textarea
            className="min-h-[120px] resize-y"
            placeholder="- O que amigos dizem?&#10;- Quem influencia?"
            value={empathyMap.oQueOuve}
            onChange={(e) => updateField("oQueOuve", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label className="text-base font-semibold mb-1 block">O que pensa e sente?</Label>
          <p className="text-xs text-muted-foreground mb-3">Preocupações, aspirações, medos</p>
          <Textarea
            className="min-h-[120px] resize-y"
            placeholder="- Quais são suas preocupações?&#10;- O que realmente importa?"
            value={empathyMap.oQuePensa}
            onChange={(e) => updateField("oQuePensa", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label className="text-base font-semibold mb-1 block">O que fala e faz?</Label>
          <p className="text-xs text-muted-foreground mb-3">Comportamento, atitudes públicas</p>
          <Textarea
            className="min-h-[120px] resize-y"
            placeholder="- Como se comporta?&#10;- O que diz para os outros?"
            value={empathyMap.oQueFala}
            onChange={(e) => updateField("oQueFala", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label className="text-base font-semibold mb-1 block">Dores</Label>
          <p className="text-xs text-muted-foreground mb-3">Frustrações, obstáculos, medos</p>
          <Textarea
            className="min-h-[120px] resize-y"
            placeholder="- Quais são suas frustrações?&#10;- O que o impede de ter sucesso?"
            value={empathyMap.dores}
            onChange={(e) => updateField("dores", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label className="text-base font-semibold mb-1 block">Ganhos</Label>
          <p className="text-xs text-muted-foreground mb-3">Desejos, necessidades, medidas de sucesso</p>
          <Textarea
            className="min-h-[120px] resize-y"
            placeholder="- O que ele realmente quer?&#10;- Como mede sucesso?"
            value={empathyMap.ganhos}
            onChange={(e) => updateField("ganhos", e.target.value)}
          />
        </Card>
      </div>
    </PageContainer>
  );
}
