import { useAuth } from "@/contexts/AuthContext";

export function useOrganization() {
  const { organization, role, user, profile } = useAuth();

  const isAdmin = role === "admin";
  const isGestor = role === "gestor";
  const isUsuario = role === "usuario";

  const canManage = isAdmin;
  const canEdit = isAdmin || isGestor;
  const canView = true;

  return {
    organization,
    role,
    user,
    profile,
    isAdmin,
    isGestor,
    isUsuario,
    canManage,
    canEdit,
    canView,
  };
}
