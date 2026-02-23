import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft } from "lucide-react";
import trinityLogo from "@/assets/trinity-logo.png";

export default function Convite() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img src={trinityLogo} alt="Trinity Hub" className="h-16 w-auto" />
          </div>

          <div className="mx-auto mb-2 p-3 rounded-full bg-primary/10">
            <Construction className="h-8 w-8 text-primary" />
          </div>

          <CardTitle className="text-xl">Funcionalidade em Desenvolvimento</CardTitle>
          <CardDescription>
            O sistema de convites esta sendo desenvolvido e estara disponivel em breve.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Em breve voce podera convidar membros para sua organizacao atraves de links de convite.
          </p>

          <Button asChild className="w-full">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
