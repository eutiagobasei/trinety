import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, ChevronDown, Plus, Check, Crown } from "lucide-react";

export function OrganizationSelector() {
  const { organization, organizations, switchOrganization } = useAuth();
  const navigate = useNavigate();

  if (!organization) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate("/onboarding")}
        className="flex items-center gap-2"
      >
        <Building2 className="h-4 w-4" />
        Criar/Entrar Empresa
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 max-w-[200px]">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{organization.name}</span>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Minhas Empresas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((userOrg) => (
          <DropdownMenuItem
            key={userOrg.id}
            onClick={() => switchOrganization(userOrg.organization_id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              {userOrg.is_owner && (
                <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
              )}
              <span className="truncate">{userOrg.organization.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground capitalize">
                {userOrg.role}
              </span>
              {userOrg.organization_id === organization.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate("/onboarding")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Criar ou Entrar em Empresa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
