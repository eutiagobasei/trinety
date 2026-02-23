import { useAuth } from "@/contexts/AuthContext";

export function useOrganization() {
  const { organization, organizations, role, user, profile, switchOrganization } = useAuth();

  const isAdmin = role === "admin";
  const isGestor = role === "gestor";
  const isUsuario = role === "usuario";

  const canManage = isAdmin;
  const canEdit = isAdmin || isGestor;
  const canView = true;

  const isOwner = organization?.isOwner ?? false;

  return {
    organization,
    organizations,
    role,
    user,
    profile,
    isAdmin,
    isGestor,
    isUsuario,
    isOwner,
    canManage,
    canEdit,
    canView,
    switchOrganization,
  };
}
