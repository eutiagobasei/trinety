import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRotinasState } from "@/hooks/useRotinasState";
import trinityLogo from "@/assets/trinity-logo.png";

export default function Rotinas() {
  const navigate = useNavigate();
  const { rotinas, updateField, loading, saving } = useRotinasState();

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
            Rotinas de Gestão
          </h1>
          <p className="text-muted-foreground">
            Defina a cadência de acompanhamento para garantir a execução do plano.
            Use tópicos (um por linha).
          </p>
        </div>
        {saving && (
          <span className="text-sm text-muted-foreground">Salvando...</span>
        )}
      </div>

      <Card className="p-6 mb-8">
        <Label htmlFor="semanal" className="text-lg font-semibold mb-2 block">
          Rotina Semanal
        </Label>
        <Textarea
          id="semanal"
          className="h-40"
          placeholder="- Revisão dos KPIs&#10;- Acompanhamento de tarefas"
          value={rotinas.semanal}
          onChange={(e) => updateField("semanal", e.target.value)}
        />
      </Card>

      <Card className="p-6 mb-8">
        <Label htmlFor="mensal" className="text-lg font-semibold mb-2 block">
          Rotina Mensal
        </Label>
        <Textarea
          id="mensal"
          className="h-40"
          placeholder="- Fechamento do mês&#10;- Ajuste dos OKRs"
          value={rotinas.mensal}
          onChange={(e) => updateField("mensal", e.target.value)}
        />
      </Card>

      <Card className="p-6 mb-8">
        <Label htmlFor="trimestral" className="text-lg font-semibold mb-2 block">
          Rotina Trimestral
        </Label>
        <Textarea
          id="trimestral"
          className="h-40"
          placeholder="- Revisão estratégica"
          value={rotinas.trimestral}
          onChange={(e) => updateField("trimestral", e.target.value)}
        />
      </Card>

      <Card className="p-6 mb-8">
        <Label htmlFor="anual" className="text-lg font-semibold mb-2 block">
          Rotina Anual
        </Label>
        <Textarea
          id="anual"
          className="h-40"
          placeholder="- Revisão completa do planejamento"
          value={rotinas.anual}
          onChange={(e) => updateField("anual", e.target.value)}
        />
      </Card>

      <div className="flex justify-between">
        <Button
          onClick={() => navigate("/plano-de-acao")}
          variant="outline"
        >
          Voltar
        </Button>

        <Button
          onClick={() => navigate("/dashboard")}
          variant="default"
        >
          Finalizar
        </Button>
      </div>
    </div>
  );
}