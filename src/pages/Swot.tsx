import { useNavigate } from "react-router-dom";
import { useSwotState } from "@/hooks/useSwotState";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import trinityLogo from "@/assets/trinity-logo.png";

export default function Swot() {
  const navigate = useNavigate();
  const { swot, updateSwot, isLoading, isSaving } = useSwotState();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-10">
      {/* Header with Logo and Dashboard button */}
      <div className="mb-8 flex items-center justify-between">
        <img src={trinityLogo} alt="Trinity Hub" className="h-12" />
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          size="sm"
        >
          ← Dashboard
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-foreground">Análise SWOT</h1>
          {isSaving && (
            <span className="text-sm text-muted-foreground">Salvando...</span>
          )}
        </div>
        <p className="text-muted-foreground">
          Liste os itens em tópicos (um por linha).  
          As combinações FO, FA, DO e DA poderão ser geradas pela IA.
        </p>
      </div>

      {/* SWOT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Forças */}
        <Card className="p-6">
          <Label htmlFor="forcas" className="text-lg font-semibold mb-2 block">
            Forças (internas)
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            O que sua empresa faz bem? Quais são seus diferenciais?
          </p>
          <Textarea
            id="forcas"
            className="min-h-[160px]"
            placeholder="- Ponto forte 1&#10;- Ponto forte 2"
            value={swot.forcas}
            onChange={(e) => updateSwot("forcas", e.target.value)}
          />
        </Card>

        {/* Fraquezas */}
        <Card className="p-6">
          <Label htmlFor="fraquezas" className="text-lg font-semibold mb-2 block">
            Fraquezas (internas)
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            O que pode ser melhorado? Quais limitações existem?
          </p>
          <Textarea
            id="fraquezas"
            className="min-h-[160px]"
            placeholder="- Ponto fraco 1&#10;- Ponto fraco 2"
            value={swot.fraquezas}
            onChange={(e) => updateSwot("fraquezas", e.target.value)}
          />
        </Card>

        {/* Oportunidades */}
        <Card className="p-6">
          <Label htmlFor="oportunidades" className="text-lg font-semibold mb-2 block">
            Oportunidades (externas)
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            Quais tendências ou situações favorecem o negócio?
          </p>
          <Textarea
            id="oportunidades"
            className="min-h-[160px]"
            placeholder="- Oportunidade 1&#10;- Oportunidade 2"
            value={swot.oportunidades}
            onChange={(e) => updateSwot("oportunidades", e.target.value)}
          />
        </Card>

        {/* Ameaças */}
        <Card className="p-6">
          <Label htmlFor="ameacas" className="text-lg font-semibold mb-2 block">
            Ameaças (externas)
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            Quais fatores externos podem prejudicar o negócio?
          </p>
          <Textarea
            id="ameacas"
            className="min-h-[160px]"
            placeholder="- Ameaça 1&#10;- Ameaça 2"
            value={swot.ameacas}
            onChange={(e) => updateSwot("ameacas", e.target.value)}
          />
        </Card>
      </div>

      {/* Combinações Estratégicas */}
      <Card className="p-6 mb-12">
        <Label htmlFor="combinacoes" className="text-lg font-semibold mb-2 block">
          Combinações Estratégicas (FO, FA, DO, DA)
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          Como usar forças para aproveitar oportunidades (FO)? Como usar forças para enfrentar ameaças (FA)?<br />
          Como superar fraquezas para aproveitar oportunidades (DO)? Como minimizar fraquezas e evitar ameaças (DA)?
        </p>
        <Textarea
          id="combinacoes"
          className="min-h-[160px]"
          placeholder="- Estratégia FO: ...&#10;- Estratégia FA: ...&#10;- Estratégia DO: ...&#10;- Estratégia DA: ..."
          value={swot.combinacoes}
          onChange={(e) => updateSwot("combinacoes", e.target.value)}
        />
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate("/filosofia")}
        >
          Voltar
        </Button>
        <Button
          size="lg"
          onClick={() => navigate("/okrs")}
        >
          Avançar
        </Button>
      </div>
    </div>
  );
}
