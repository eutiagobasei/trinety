import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCanvasState } from "@/hooks/useCanvasState";
import { Loader2 } from "lucide-react";
import trinityLogo from "@/assets/trinity-logo.png";

export default function ModeloDeNegocio() {
  const navigate = useNavigate();
  const { canvas, updateField, isLoading, isSaving } = useCanvasState();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={trinityLogo} alt="Trinity Hub" className="h-10" />
            <div>
              <p className="text-sm text-muted-foreground">Business Model Canvas</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isSaving && (
              <span className="text-xs flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Salvando...
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Modelo de Negócio — Business Model Canvas
          </h1>
          <p className="text-muted-foreground">
            Edite os 9 blocos do Canvas conforme sua estratégia.
            <br />
            Use tópicos (um por linha) para melhor interpretação da IA.
          </p>
        </div>

        {/* GRID DO CANVAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* COLUNA 1 */}
          <div className="space-y-6">
            {/* Segmentos de Clientes */}
            <Card>
              <CardHeader>
                <CardTitle>Segmentos de Cliente</CardTitle>
                <CardDescription>
                  Liste os tipos de clientes que você atende. Um por linha.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[120px] resize-y"
                  placeholder={"- Cliente 1\n- Cliente 2"}
                  value={canvas.segmentos}
                  onChange={(e) => updateField("segmentos", e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Proposta de Valor */}
            <Card>
              <CardHeader>
                <CardTitle>Proposta de Valor</CardTitle>
                <CardDescription>
                  Liste os seus diferenciais e propostas centrais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[120px] resize-y"
                  placeholder={"- Diferencial 1\n- Diferencial 2"}
                  value={canvas.proposta}
                  onChange={(e) => updateField("proposta", e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* COLUNA 2 */}
          <div className="space-y-6">
            {/* Canais */}
            <Card>
              <CardHeader>
                <CardTitle>Canais</CardTitle>
                <CardDescription>
                  Como o cliente te encontra. Liste canais um por linha.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[120px] resize-y"
                  placeholder={"- Instagram\n- Indicação"}
                  value={canvas.canais}
                  onChange={(e) => updateField("canais", e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Relacionamento */}
            <Card>
              <CardHeader>
                <CardTitle>Relacionamento</CardTitle>
                <CardDescription>
                  Como você se relaciona com seus clientes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[120px] resize-y"
                  placeholder={"- Acompanhamento próximo\n- Atendimento rápido"}
                  value={canvas.relacionamento}
                  onChange={(e) => updateField("relacionamento", e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* COLUNA 3 */}
          <div className="space-y-6">
            {/* Atividades-chave */}
            <Card>
              <CardHeader>
                <CardTitle>Atividades Principais</CardTitle>
                <CardDescription>
                  As atividades essenciais para gerar valor.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[120px] resize-y"
                  placeholder={"- Entrevistas\n- Execução técnica"}
                  value={canvas.atividades}
                  onChange={(e) => updateField("atividades", e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Recursos-chave */}
            <Card>
              <CardHeader>
                <CardTitle>Recursos Principais</CardTitle>
                <CardDescription>
                  Talentos, ferramentas e elementos essenciais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[120px] resize-y"
                  placeholder={"- Liderança\n- Softwares"}
                  value={canvas.recursos}
                  onChange={(e) => updateField("recursos", e.target.value)}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* LINHA INFERIOR DO CANVAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Parceiros */}
          <Card>
            <CardHeader>
              <CardTitle>Parceiros Chave</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[120px] resize-y"
                placeholder={"- Fornecedor X\n- Plataforma Y"}
                value={canvas.parceiros}
                onChange={(e) => updateField("parceiros", e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Estrutura de Custos */}
          <Card>
            <CardHeader>
              <CardTitle>Estrutura de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[120px] resize-y"
                placeholder={"- Custos fixos\n- Custos variáveis"}
                value={canvas.custos}
                onChange={(e) => updateField("custos", e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Fontes de Receita */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Fontes de Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[120px] resize-y"
                placeholder={"- Serviço A\n- Assinatura B"}
                value={canvas.receitas}
                onChange={(e) => updateField("receitas", e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* BOTÕES */}
        <div className="flex justify-between mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/dashboard")}
          >
            Voltar
          </Button>

          <Button
            size="lg"
            onClick={() => navigate("/mapa-de-empatia")}
          >
            Avançar
          </Button>
        </div>
      </main>
    </div>
  );
}
