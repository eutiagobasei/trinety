import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiClient } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  fullName: string | null;
  isSystemAdmin: boolean;
  activeOrganizationId: string | null;
}

interface Organization {
  id: string;
  name: string;
  code: string;
  role: AppRole;
  isOwner: boolean;
}

type AppRole = "admin" | "gestor" | "usuario";

interface ProfileResponse {
  id: string;
  email: string;
  fullName: string | null;
  isSystemAdmin: boolean;
  activeOrganizationId: string | null;
  organizations: Organization[];
  currentRole: AppRole | null;
  isOwner: boolean;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  profile: User | null;
  organization: Organization | null;
  organizations: Organization[];
  role: AppRole | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await apiClient.get<ProfileResponse>("/auth/profile");

      setUser({
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        isSystemAdmin: data.isSystemAdmin,
        activeOrganizationId: data.activeOrganizationId,
      });

      setIsSuperAdmin(data.isSystemAdmin);
      setOrganizations(data.organizations);

      if (data.activeOrganizationId && data.organizations.length > 0) {
        const activeOrg = data.organizations.find(
          (o) => o.id === data.activeOrganizationId
        );
        if (activeOrg) {
          setOrganization(activeOrg);
          setRole(activeOrg.role);
        }
      } else if (data.organizations.length > 0) {
        const firstOrg = data.organizations[0];
        setOrganization(firstOrg);
        setRole(firstOrg.role);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      apiClient.clearTokens();
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const data = await apiClient.post<AuthResponse>("/auth/signup", {
        email,
        password,
        fullName,
      });

      apiClient.setToken(data.accessToken);
      apiClient.setRefreshToken(data.refreshToken);

      setUser(data.user);
      setIsSuperAdmin(data.user.isSystemAdmin);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await apiClient.post<AuthResponse>("/auth/signin", {
        email,
        password,
      });

      apiClient.setToken(data.accessToken);
      apiClient.setRefreshToken(data.refreshToken);

      await fetchProfile();

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    apiClient.clearTokens();
    setUser(null);
    setOrganization(null);
    setOrganizations([]);
    setRole(null);
    setIsSuperAdmin(false);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const switchOrganization = async (organizationId: string) => {
    try {
      await apiClient.post("/auth/switch-organization", { organizationId });

      const org = organizations.find((o) => o.id === organizationId);
      if (org) {
        setOrganization(org);
        setRole(org.role);
      }
    } catch (error) {
      console.error("Error switching organization:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user,
        organization,
        organizations,
        role,
        isLoading,
        isSuperAdmin,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        switchOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
