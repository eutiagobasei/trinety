import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useFilosofiaState } from "@/hooks/useFilosofiaState";
import trinityLogo from "@/assets/trinity-logo.png";

export default function Filosofia() {
  const navigate = useNavigate();
  const { filosofia, updateFilosofia, isLoading, isSaving } = useFilosofiaState();

  if (isLoading) {
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

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-foreground">
          Filosofia do Negócio — Visão, Missão e Valores
        </h1>
        {isSaving && (
          <span className="text-sm text-muted-foreground">Salvando...</span>
        )}
      </div>
      
      <p className="text-muted-foreground mb-10">
        Defina a essência estratégica do seu negócio.
        <br />
        Use tópicos (um por linha) somente nos valores.
      </p>

      <div className="grid grid-cols-1 gap-8">
        <Card className="p-6">
          <Label className="text-xl font-semibold mb-2 block">Visão</Label>
          <p className="text-xs text-muted-foreground mb-2">
            *Onde você quer chegar? Que futuro deseja construir?*
          </p>
          <Textarea
            className="h-40"
            placeholder="Ex: Ser referência nacional em..."
            value={filosofia.visao}
            onChange={(e) => updateFilosofia("visao", e.target.value)}
          />
        </Card>

        <Card className="p-6">
          <Label className="text-xl font-semibold mb-2 block">Missão</Label>
          <p className="text-xs text-muted-foreground mb-2">
            *O que você faz, para quem e por quê?*
          </p>
          <Textarea
            className="h-40"
            placeholder="Ex: Ajudar empresas a..."
            value={filosofia.missao}
            onChange={(e) => updateFilosofia("missao", e.target.value)}
          />
        </Card>

        <Card className="p-6">
          <Label className="text-xl font-semibold mb-2 block">Valores</Label>
          <p className="text-xs text-muted-foreground mb-2">
            *Liste valores essenciais que guiam decisões e comportamentos. Um por linha.*
          </p>
          <Textarea
            className="h-40"
            placeholder="- Transparência&#10;- Agilidade&#10;- Respeito"
            value={filosofia.valores}
            onChange={(e) => updateFilosofia("valores", e.target.value)}
          />
        </Card>
      </div>

      <div className="flex justify-between mt-12">
        <Button
          variant="outline"
          onClick={() => navigate("/mapa-de-empatia")}
        >
          Voltar
        </Button>

        <Button onClick={() => navigate("/swot")}>
          Avançar
        </Button>
      </div>
    </div>
  );
}
