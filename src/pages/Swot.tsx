import { useSwotState } from "@/hooks/useSwotState";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageContainer } from "@/components/layout";

export default function Swot() {
  const { swot, updateSwot, isLoading, isSaving } = useSwotState();

  return (
    <PageContainer
      title="Análise SWOT"
      description="Liste os itens em tópicos (um por linha). As combinações FO, FA, DO e DA poderão ser geradas pela IA."
      isLoading={isLoading}
      isSaving={isSaving}
      prevRoute="/filosofia"
      nextRoute="/okrs"
    >
      {/* SWOT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Forças */}
        <Card className="p-5">
          <Label htmlFor="forcas" className="text-base font-semibold mb-1 block">
            Forças (internas)
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            O que sua empresa faz bem? Quais são seus diferenciais?
          </p>
          <Textarea
            id="forcas"
            className="min-h-[140px] resize-y"
            placeholder="- Ponto forte 1&#10;- Ponto forte 2"
            value={swot.forcas}
            onChange={(e) => updateSwot("forcas", e.target.value)}
          />
        </Card>

        {/* Fraquezas */}
        <Card className="p-5">
          <Label htmlFor="fraquezas" className="text-base font-semibold mb-1 block">
            Fraquezas (internas)
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            O que pode ser melhorado? Quais limitações existem?
          </p>
          <Textarea
            id="fraquezas"
            className="min-h-[140px] resize-y"
            placeholder="- Ponto fraco 1&#10;- Ponto fraco 2"
            value={swot.fraquezas}
            onChange={(e) => updateSwot("fraquezas", e.target.value)}
          />
        </Card>

        {/* Oportunidades */}
        <Card className="p-5">
          <Label htmlFor="oportunidades" className="text-base font-semibold mb-1 block">
            Oportunidades (externas)
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            Quais tendências ou situações favorecem o negócio?
          </p>
          <Textarea
            id="oportunidades"
            className="min-h-[140px] resize-y"
            placeholder="- Oportunidade 1&#10;- Oportunidade 2"
            value={swot.oportunidades}
            onChange={(e) => updateSwot("oportunidades", e.target.value)}
          />
        </Card>

        {/* Ameaças */}
        <Card className="p-5">
          <Label htmlFor="ameacas" className="text-base font-semibold mb-1 block">
            Ameaças (externas)
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            Quais fatores externos podem prejudicar o negócio?
          </p>
          <Textarea
            id="ameacas"
            className="min-h-[140px] resize-y"
            placeholder="- Ameaça 1&#10;- Ameaça 2"
            value={swot.ameacas}
            onChange={(e) => updateSwot("ameacas", e.target.value)}
          />
        </Card>
      </div>

      {/* Combinações Estratégicas */}
      <Card className="p-5">
        <Label htmlFor="combinacoes" className="text-base font-semibold mb-1 block">
          Combinações Estratégicas (FO, FA, DO, DA)
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          Como usar forças para aproveitar oportunidades (FO)? Como usar forças para enfrentar ameaças (FA)?
          Como superar fraquezas para aproveitar oportunidades (DO)? Como minimizar fraquezas e evitar ameaças (DA)?
        </p>
        <Textarea
          id="combinacoes"
          className="min-h-[140px] resize-y"
          placeholder="- Estratégia FO: ...&#10;- Estratégia FA: ...&#10;- Estratégia DO: ...&#10;- Estratégia DA: ..."
          value={swot.combinacoes}
          onChange={(e) => updateSwot("combinacoes", e.target.value)}
        />
      </Card>
    </PageContainer>
  );
}
