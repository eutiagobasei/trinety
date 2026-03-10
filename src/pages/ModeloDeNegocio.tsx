import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCanvasState } from "@/hooks/useCanvasState";
import { PageContainer } from "@/components/layout";

export default function ModeloDeNegocio() {
  const { canvas, updateField, isLoading, isSaving } = useCanvasState();

  return (
    <PageContainer
      title="Modelo de Negócio — Business Model Canvas"
      description="Edite os 9 blocos do Canvas conforme sua estratégia. Use tópicos (um por linha) para melhor interpretação da IA."
      isLoading={isLoading}
      isSaving={isSaving}
      prevRoute="/dashboard"
      nextRoute="/mapa-de-empatia"
      prevLabel="Dashboard"
    >
      {/* GRID DO CANVAS - 3 COLUNAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Segmentos de Clientes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Segmentos de Cliente</CardTitle>
            <CardDescription className="text-sm">
              Liste os tipos de clientes que você atende.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-[100px] resize-y"
              placeholder={"- Cliente 1\n- Cliente 2"}
              value={canvas.segmentos}
              onChange={(e) => updateField("segmentos", e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Canais */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Canais</CardTitle>
            <CardDescription className="text-sm">
              Como o cliente te encontra.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-[100px] resize-y"
              placeholder={"- Instagram\n- Indicação"}
              value={canvas.canais}
              onChange={(e) => updateField("canais", e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Atividades-chave */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Atividades Principais</CardTitle>
            <CardDescription className="text-sm">
              Atividades essenciais para gerar valor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-[100px] resize-y"
              placeholder={"- Entrevistas\n- Execução técnica"}
              value={canvas.atividades}
              onChange={(e) => updateField("atividades", e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Proposta de Valor */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Proposta de Valor</CardTitle>
            <CardDescription className="text-sm">
              Seus diferenciais e propostas centrais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-[100px] resize-y"
              placeholder={"- Diferencial 1\n- Diferencial 2"}
              value={canvas.proposta}
              onChange={(e) => updateField("proposta", e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Relacionamento */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Relacionamento</CardTitle>
            <CardDescription className="text-sm">
              Como você se relaciona com clientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-[100px] resize-y"
              placeholder={"- Acompanhamento próximo\n- Atendimento rápido"}
              value={canvas.relacionamento}
              onChange={(e) => updateField("relacionamento", e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Recursos-chave */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recursos Principais</CardTitle>
            <CardDescription className="text-sm">
              Talentos, ferramentas e elementos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-[100px] resize-y"
              placeholder={"- Liderança\n- Softwares"}
              value={canvas.recursos}
              onChange={(e) => updateField("recursos", e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {/* LINHA INFERIOR DO CANVAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Parceiros */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Parceiros Chave</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-[100px] resize-y"
              placeholder={"- Fornecedor X\n- Plataforma Y"}
              value={canvas.parceiros}
              onChange={(e) => updateField("parceiros", e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Estrutura de Custos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Estrutura de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-[100px] resize-y"
              placeholder={"- Custos fixos\n- Custos variáveis"}
              value={canvas.custos}
              onChange={(e) => updateField("custos", e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Fontes de Receita */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Fontes de Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-[100px] resize-y"
              placeholder={"- Serviço A\n- Assinatura B"}
              value={canvas.receitas}
              onChange={(e) => updateField("receitas", e.target.value)}
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
