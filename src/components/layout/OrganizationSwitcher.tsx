import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function OrganizationSwitcher() {
  const { organization, organizations, switchOrganization } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitch = async (orgId: string) => {
    if (orgId !== organization?.id) {
      await switchOrganization(orgId);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 px-3"
        >
          <Building2 className="size-4 text-muted-foreground" />
          <span className="max-w-[150px] truncate hidden sm:inline">
            {organization?.name || "Selecionar"}
          </span>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuLabel>Suas empresas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSwitch(org.id)}
            className="gap-2"
          >
            <div className="flex size-6 items-center justify-center rounded bg-primary/10 text-primary text-xs font-medium">
              {org.name.charAt(0).toUpperCase()}
            </div>
            <span className="flex-1 truncate">{org.name}</span>
            {org.id === organization?.id && (
              <Check className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false);
            navigate("/criar-empresa");
          }}
          className="gap-2"
        >
          <Plus className="size-4" />
          Nova empresa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
