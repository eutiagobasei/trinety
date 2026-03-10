import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { OrganizationSwitcher } from "./OrganizationSwitcher";

const pageTitles: Record<string, { title: string; parent?: string }> = {
  "/dashboard": { title: "Dashboard" },
  "/diagnostico": { title: "Diagnóstico", parent: "Dashboard" },
  "/modelo-de-negocio": { title: "Modelo de Negócio", parent: "Planejamento" },
  "/mapa-de-empatia": { title: "Mapa de Empatia", parent: "Planejamento" },
  "/filosofia": { title: "Filosofia", parent: "Planejamento" },
  "/swot": { title: "SWOT", parent: "Planejamento" },
  "/okrs": { title: "OKRs", parent: "Execução" },
  "/indicadores": { title: "Indicadores", parent: "Execução" },
  "/plano-de-acao": { title: "Plano de Ação", parent: "Execução" },
  "/rotinas": { title: "Rotinas de Gestão", parent: "Execução" },
  "/admin": { title: "Painel Admin" },
};

export function AppHeader() {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: "Página" };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Início</BreadcrumbLink>
          </BreadcrumbItem>
          {pageInfo.parent && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-muted-foreground">
                  {pageInfo.parent}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
          {location.pathname !== "/dashboard" && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageInfo.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <OrganizationSwitcher />
    </header>
  );
}
