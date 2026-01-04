import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import trinityLogo from "@/assets/trinity-logo.png";

const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .substring(0, 14);
};

export default function Login() {
  const navigate = useNavigate();

  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isValid = cpf.length === 14 && email.includes("@");

  const handleLogin = () => {
    setLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      if (cpf && email) {
        navigate("/dashboard");
      } else {
        setErrorMsg("CPF ou email incorretos.");
      }
      setLoading(false);
    }, 1000);
  };

  const handleForgot = () => {
    setShowForgotModal(false);
    setForgotEmail("");

    setTimeout(() => {
      alert(
        "Se este email estiver cadastrado, você receberá um link para redefinir sua senha."
      );
    }, 400);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background px-6">
      {/* Botão Flutuante de Suporte */}
      <a
        href="https://wa.me/5531999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 bg-success text-success-foreground px-4 py-3 rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2 z-50"
      >
        <span className="font-medium">Suporte</span>
      </a>

      {/* Ícone de Suporte no topo */}
      <a
        href="https://wa.me/5531999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors text-2xl"
        aria-label="Suporte"
      >
        🛟
      </a>

      {/* Container principal */}
      <div className="w-full max-w-md bg-card p-10 shadow-xl rounded-xl border border-border text-center">
        {/* Logo */}
        <div className="mb-8">
          <img
            src={trinityLogo}
            alt="Trinity Hub"
            className="h-16 mx-auto mb-2"
          />
          <p className="text-sm text-muted-foreground">Planejamento Estratégico</p>
        </div>

        <h2 className="text-xl font-semibold text-card-foreground mb-6">
          Acesse sua conta
        </h2>

        {/* CPF */}
        <div className="text-left mb-5">
          <Label htmlFor="cpf" className="text-card-foreground font-medium">
            CPF
          </Label>
          <Input
            id="cpf"
            type="text"
            value={cpf}
            onChange={(e) => setCpf(maskCPF(e.target.value))}
            placeholder="000.000.000-00"
            className="mt-2"
          />
        </div>

        {/* Email */}
        <div className="text-left mb-6">
          <Label htmlFor="email" className="text-card-foreground font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            className="mt-2"
          />
        </div>

        {/* Erro */}
        {errorMsg && (
          <p className="text-destructive text-sm mb-3">{errorMsg}</p>
        )}

        {/* Botão Entrar */}
        <Button
          disabled={!isValid || loading}
          onClick={handleLogin}
          className="w-full"
          size="lg"
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>

        {/* Link Esqueci a senha */}
        <button
          className="mt-4 text-primary hover:underline text-sm font-medium"
          onClick={() => setShowForgotModal(true)}
        >
          Esqueci minha senha
        </button>

        {/* Link Suporte no rodapé */}
        <div className="mt-6">
          <a
            href="https://wa.me/5531999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground text-sm hover:underline"
          >
            Precisa de ajuda? Fale com o suporte
          </a>
        </div>
      </div>

      {/* Modal Esqueci Senha */}
      <Dialog open={showForgotModal} onOpenChange={setShowForgotModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar senha</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="forgot-email" className="text-card-foreground font-medium">
                Email cadastrado
              </Label>
              <Input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForgotModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleForgot}>
              Enviar link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
