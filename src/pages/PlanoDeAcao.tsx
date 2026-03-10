import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionPlanState } from "@/hooks/useActionPlanState";
import { PageContainer } from "@/components/layout";
import { Plus } from "lucide-react";

export default function PlanoDeAcao() {
  const { actions, updateAction, addAction, loading, saving } = useActionPlanState();

  return (
    <PageContainer
      title="Plano de Ação"
      description="Organize as ações necessárias para alcançar seus objetivos estratégicos."
      isLoading={loading}
      isSaving={saving}
      prevRoute="/indicadores"
      nextRoute="/rotinas"
    >
      <div className="space-y-4">
        {actions.map((action, i) => (
          <Card key={i} className="p-5">
            <h2 className="font-semibold text-foreground mb-4">Ação {i + 1}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <Label className="text-sm">Ação</Label>
                <Input
                  placeholder="Descreva a ação"
                  value={action.acao}
                  onChange={(e) => updateAction(i, "acao", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm">Responsável</Label>
                <Input
                  placeholder="Quem?"
                  value={action.responsavel}
                  onChange={(e) => updateAction(i, "responsavel", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm">Prazo</Label>
                <Input
                  placeholder="Até quando?"
                  value={action.prazo}
                  onChange={(e) => updateAction(i, "prazo", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm">Status</Label>
                <Input
                  placeholder="Não iniciado"
                  value={action.status}
                  onChange={(e) => updateAction(i, "status", e.target.value)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={addAction} variant="outline" className="gap-2">
        <Plus className="h-4 w-4" />
        Adicionar Ação
      </Button>
    </PageContainer>
  );
}
