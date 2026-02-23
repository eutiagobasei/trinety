import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, User, Building2, Shield } from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const { user, organization, organizations, role, signOut, isSuperAdmin } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Painel Administrativo</h1>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informacoes do Usuario
              </CardTitle>
              <CardDescription>Seus dados de acesso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{user.fullName || "Nao informado"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex gap-2 mt-1">
                  {isSuperAdmin && (
                    <Badge variant="default">
                      <Shield className="h-3 w-3 mr-1" />
                      Super Admin
                    </Badge>
                  )}
                  {role && (
                    <Badge variant="secondary">{role}</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organizacao Atual
              </CardTitle>
              <CardDescription>Empresa selecionada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {organization ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{organization.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Codigo</p>
                    <Badge variant="outline">{organization.code}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seu Papel</p>
                    <Badge variant="secondary">{organization.role}</Badge>
                  </div>
                  {organization.isOwner && (
                    <Badge variant="default">Proprietario</Badge>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Nenhuma organizacao selecionada</p>
              )}
            </CardContent>
          </Card>

          {/* Organizations List Card */}
          <Card>
            <CardHeader>
              <CardTitle>Suas Organizacoes</CardTitle>
              <CardDescription>
                {organizations.length} organizacao(oes) vinculada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {organizations.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma organizacao encontrada</p>
              ) : (
                <div className="space-y-2">
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className={`flex items-center justify-between p-2 rounded-lg border ${
                        org.id === organization?.id
                          ? "bg-primary/5 border-primary/30"
                          : "bg-muted/30"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm">{org.name}</p>
                        <p className="text-xs text-muted-foreground">{org.code}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {org.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Development Notice */}
        <Card className="mt-6">
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              Funcionalidades administrativas avancadas (gestao de usuarios, empresas, assinaturas)
              estao em desenvolvimento e serao disponibilizadas em breve.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
