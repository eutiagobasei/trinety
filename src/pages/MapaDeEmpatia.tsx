import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useEmpathyMapState } from "@/hooks/useEmpathyMapState";
import trinityLogo from "@/assets/trinity-logo.png";

export default function MapaDeEmpatia() {
  const navigate = useNavigate();
  const { empathyMap, updateField, isLoading, isSaving } = useEmpathyMapState();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <img src={trinityLogo} alt="Trinity Hub" className="h-12" />
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          size="sm"
        >
          ← Dashboard
        </Button>
      </div>

      {/* Título */}
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Mapa de Empatia do Cliente
      </h1>
      <p className="text-muted-foreground mb-10">
        Preencha os campos abaixo com insights sobre seu cliente ideal.  
        <br />Use tópicos, um por linha, para maior precisão.
      </p>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DORES */}
        <Card className="p-6">
          <Label className="font-semibold text-foreground mb-2 block">Dores</Label>
          <p className="text-xs text-muted-foreground mb-2">
            *O que causa frustração, perda, medo ou incômodo? Um por linha.*
          </p>
          <Textarea
            className="h-32"
            placeholder="- Falta de tempo&#10;- Não sabe organizar o negócio"
            value={empathyMap.dores}
            onChange={(e) => updateField("dores", e.target.value)}
          />
        </Card>

        {/* GANHOS */}
        <Card className="p-6">
          <Label className="font-semibold text-foreground mb-2 block">Ganhos</Label>
          <p className="text-xs text-muted-foreground mb-2">
            *O que ele gostaria de alcançar? Quais resultados deseja?*
          </p>
          <Textarea
            className="h-32"
            placeholder="- Ter previsibilidade&#10;- Aumentar faturamento"
            value={empathyMap.ganhos}
            onChange={(e) => updateField("ganhos", e.target.value)}
          />
        </Card>

        {/* NECESSIDADES */}
        <Card className="p-6">
          <Label className="font-semibold text-foreground mb-2 block">Necessidades</Label>
          <p className="text-xs text-muted-foreground mb-2">
            *O que ele realmente precisa para avançar?*
          </p>
          <Textarea
            className="h-32"
            placeholder="- Estrutura&#10;- Processos claros"
            value={empathyMap.necessidades}
            onChange={(e) => updateField("necessidades", e.target.value)}
          />
        </Card>

        {/* PENSAMENTOS */}
        <Card className="p-6">
          <Label className="font-semibold text-foreground mb-2 block">O que ele pensa?</Label>
          <p className="text-xs text-muted-foreground mb-2">
            *Quais pensamentos, crenças ou frases típicas desse cliente?*
          </p>
          <Textarea
            className="h-32"
            placeholder='- "Preciso organizar meu negócio"&#10;- "Não tenho tempo"'
            value={empathyMap.pensamentos}
            onChange={(e) => updateField("pensamentos", e.target.value)}
          />
        </Card>

        {/* SENTIMENTOS */}
        <Card className="p-6">
          <Label className="font-semibold text-foreground mb-2 block">Sentimentos</Label>
          <p className="text-xs text-muted-foreground mb-2">
            *Como ele se sente durante a jornada atual?*
          </p>
          <Textarea
            className="h-32"
            placeholder="- Ansioso&#10;- Exausto&#10;- Sobrecarregado"
            value={empathyMap.sentimentos}
            onChange={(e) => updateField("sentimentos", e.target.value)}
          />
        </Card>

        {/* OBJEÇÕES */}
        <Card className="p-6">
          <Label className="font-semibold text-foreground mb-2 block">Objeções</Label>
          <p className="text-xs text-muted-foreground mb-2">
            *O que faz ele hesitar ou travar?*
          </p>
          <Textarea
            className="h-32"
            placeholder='- "Não sei se vai funcionar"&#10;- "Não tenho dinheiro"'
            value={empathyMap.objecoes}
            onChange={(e) => updateField("objecoes", e.target.value)}
          />
        </Card>
      </div>

      {/* BOTÕES */}
      <div className="flex justify-between mt-12">
        <Button variant="outline" onClick={() => navigate("/modelo-de-negocio")}>
          Voltar
        </Button>

        <Button onClick={() => navigate("/filosofia")}>
          Avançar
        </Button>
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <p className="text-sm text-muted-foreground text-center mt-4">Salvando...</p>
      )}
    </div>
  );
}
