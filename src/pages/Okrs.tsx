import { useNavigate } from "react-router-dom";
import { useOkrsState } from "@/hooks/useOkrsState";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import trinityLogo from "@/assets/trinity-logo.png";

export default function Okrs() {
  const navigate = useNavigate();
  const { okrs, updateOkrs, isLoading, isSaving } = useOkrsState();

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
        <h1 className="text-3xl font-bold text-foreground">OKRs — 2026</h1>
        {isSaving && (
          <span className="text-sm text-muted-foreground">Salvando...</span>
        )}
      </div>
      <p className="text-muted-foreground mb-8">
        Preencha seu grande objetivo e os resultados-chave.
        <br />
        Use tópicos (um por linha) nos KRs.
      </p>

      {/* OBJETIVO */}
      <Card className="p-6 mb-10">
        <Label htmlFor="objetivo" className="text-lg font-semibold mb-2 block">
          Objetivo
        </Label>
        <Textarea
          id="objetivo"
          className="h-32"
          placeholder="Ex: Crescer com estrutura e previsibilidade."
          value={okrs.objetivo}
          onChange={(e) => updateOkrs("objetivo", e.target.value)}
        />
      </Card>

      {/* KRS */}
      <Card className="p-6">
        <Label htmlFor="krs" className="text-lg font-semibold mb-2 block">
          Resultados-Chave (KRs)
        </Label>
        <Textarea
          id="krs"
          className="h-40"
          placeholder="- Aumentar X%&#10;- Reduzir Y&#10;- Implementar Z"
          value={okrs.krs}
          onChange={(e) => updateOkrs("krs", e.target.value)}
        />
      </Card>

      {/* BOTÕES */}
      <div className="flex justify-between mt-12">
        <Button variant="outline" onClick={() => navigate("/swot")}>
          Voltar
        </Button>
        <Button onClick={() => navigate("/indicadores")}>Avançar</Button>
      </div>
    </div>
  );
}
