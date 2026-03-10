import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRotinasState } from "@/hooks/useRotinasState";
import { PageContainer } from "@/components/layout";

export default function Rotinas() {
  const { rotinas, updateRotina, isLoading, isSaving } = useRotinasState();

  return (
    <PageContainer
      title="Rotinas de Gestão"
      description="Defina a cadência e os rituais para sustentar o planejamento estratégico."
      isLoading={isLoading}
      isSaving={isSaving}
      prevRoute="/plano-de-acao"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <Label className="text-base font-semibold mb-2 block">Rotina Diária</Label>
          <Textarea className="min-h-[120px] resize-y" placeholder="- Check-in matinal&#10;- Revisão de tarefas" value={rotinas.diaria} onChange={(e) => updateRotina("diaria", e.target.value)} />
        </Card>
        <Card className="p-5">
          <Label className="text-base font-semibold mb-2 block">Rotina Semanal</Label>
          <Textarea className="min-h-[120px] resize-y" placeholder="- Reunião de equipe&#10;- Review de indicadores" value={rotinas.semanal} onChange={(e) => updateRotina("semanal", e.target.value)} />
        </Card>
        <Card className="p-5">
          <Label className="text-base font-semibold mb-2 block">Rotina Mensal</Label>
          <Textarea className="min-h-[120px] resize-y" placeholder="- Fechamento de mês&#10;- Análise de KPIs" value={rotinas.mensal} onChange={(e) => updateRotina("mensal", e.target.value)} />
        </Card>
        <Card className="p-5">
          <Label className="text-base font-semibold mb-2 block">Rotina Trimestral</Label>
          <Textarea className="min-h-[120px] resize-y" placeholder="- Revisão de OKRs&#10;- Planejamento" value={rotinas.trimestral} onChange={(e) => updateRotina("trimestral", e.target.value)} />
        </Card>
        <Card className="p-5">
          <Label className="text-base font-semibold mb-2 block">Rotina Anual</Label>
          <Textarea className="min-h-[120px] resize-y" placeholder="- Planejamento estratégico&#10;- Retrospectiva" value={rotinas.anual} onChange={(e) => updateRotina("anual", e.target.value)} />
        </Card>
      </div>
    </PageContainer>
  );
}
