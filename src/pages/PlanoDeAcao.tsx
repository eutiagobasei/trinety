import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActionPlanState } from "@/hooks/useActionPlanState";
import trinityLogo from "@/assets/trinity-logo.png";

export default function PlanoDeAcao() {
  const navigate = useNavigate();
  const { actions, updateAction, addAction, loading, saving } = useActionPlanState();

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
            Plano de Ação 2026
          </h1>
          <p className="text-muted-foreground">
            Todas as ações estratégicas consolidadas em um único lugar.
          </p>
        </div>
        {saving && (
          <span className="text-sm text-muted-foreground">Salvando...</span>
        )}
      </div>

      {actions.map((a, i) => (
        <Card key={i} className="p-6 mb-8">
          <h2 className="font-semibold text-foreground mb-4">Ação {i + 1}</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor={`acao-${i}`}>Descrição da ação</Label>
              <Textarea
                id={`acao-${i}`}
                placeholder="Descreva a ação estratégica"
                value={a.acao}
                onChange={(e) => updateAction(i, "acao", e.target.value)}
                className="h-24"
              />
            </div>

            <div>
              <Label htmlFor={`origem-${i}`}>Origem da ação</Label>
              <Select
                value={a.origem}
                onValueChange={(value) => updateAction(i, "origem", value)}
              >
                <SelectTrigger id={`origem-${i}`}>
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SWOT">SWOT</SelectItem>
                  <SelectItem value="OKR">OKR</SelectItem>
                  <SelectItem value="Indicador">Indicador</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`responsavel-${i}`}>Responsável</Label>
              <Input
                id={`responsavel-${i}`}
                placeholder="Nome do responsável"
                value={a.responsavel}
                onChange={(e) => updateAction(i, "responsavel", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor={`prazo-${i}`}>Prazo</Label>
              <Input
                id={`prazo-${i}`}
                type="date"
                value={a.prazo}
                onChange={(e) => updateAction(i, "prazo", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor={`status-${i}`}>Status</Label>
              <Select
                value={a.status}
                onValueChange={(value) => updateAction(i, "status", value)}
              >
                <SelectTrigger id={`status-${i}`}>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Não iniciado">Não iniciado</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`obs-${i}`}>Observações</Label>
              <Textarea
                id={`obs-${i}`}
                placeholder="Observações adicionais"
                value={a.obs}
                onChange={(e) => updateAction(i, "obs", e.target.value)}
                className="h-24"
              />
            </div>
          </div>
        </Card>
      ))}

      <Button
        onClick={addAction}
        variant="default"
        className="mb-12"
      >
        + Adicionar Ação
      </Button>

      <div className="flex justify-between">
        <Button
          onClick={() => navigate("/indicadores")}
          variant="outline"
        >
          Voltar
        </Button>
        <Button
          onClick={() => navigate("/rotinas")}
          variant="default"
        >
          Avançar
        </Button>
      </div>
    </div>
  );
}