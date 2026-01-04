import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useIndicadoresState } from "@/hooks/useIndicadoresState";
import trinityLogo from "@/assets/trinity-logo.png";

export default function Indicadores() {
  const navigate = useNavigate();
  const { indicators, updateIndicator, addIndicator, loading, saving } = useIndicadoresState();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-10">
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

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Indicadores Estratégicos (KPIs)
          </h1>
          <p className="text-muted-foreground">
            Crie os KPIs do seu negócio para 2026. Cada indicador pode ter metas mensais.
          </p>
        </div>
        {saving && (
          <span className="text-sm text-muted-foreground">Salvando...</span>
        )}
      </div>

      {indicators.map((kpi, i) => (
        <Card key={i} className="p-6 mb-8">
          <h2 className="font-semibold text-foreground mb-4">Indicador {i + 1}</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor={`nome-${i}`}>Nome do indicador</Label>
              <Input
                id={`nome-${i}`}
                placeholder="Ex: Taxa de Conversão"
                value={kpi.nome}
                onChange={(e) => updateIndicator(i, "nome", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor={`descricao-${i}`}>Descrição</Label>
              <Textarea
                id={`descricao-${i}`}
                placeholder="Descreva o que este indicador mede"
                value={kpi.descricao}
                onChange={(e) => updateIndicator(i, "descricao", e.target.value)}
                className="h-24"
              />
            </div>

            <div>
              <Label htmlFor={`meta-${i}`}>Meta anual</Label>
              <Input
                id={`meta-${i}`}
                placeholder="Ex: 30%"
                value={kpi.meta}
                onChange={(e) => updateIndicator(i, "meta", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor={`origem-${i}`}>Origem (KR relacionado)</Label>
              <Input
                id={`origem-${i}`}
                placeholder="Qual resultado-chave está ligado a este KPI?"
                value={kpi.origem}
                onChange={(e) => updateIndicator(i, "origem", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor={`mensal-${i}`}>Metas mensais</Label>
              <Textarea
                id={`mensal-${i}`}
                placeholder="Liste metas mensais (um por linha)&#10;- Jan: 5%&#10;- Fev: 10%"
                value={kpi.mensal}
                onChange={(e) => updateIndicator(i, "mensal", e.target.value)}
                className="h-32"
              />
            </div>
          </div>
        </Card>
      ))}

      <Button
        onClick={addIndicator}
        variant="default"
        className="mb-12"
      >
        + Adicionar Indicador
      </Button>

      <div className="flex justify-between">
        <Button
          onClick={() => navigate("/okrs")}
          variant="outline"
        >
          Voltar
        </Button>
        <Button
          onClick={() => navigate("/plano-de-acao")}
          variant="default"
        >
          Avançar
        </Button>
      </div>
    </div>
  );
}