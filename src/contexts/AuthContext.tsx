import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  active_organization_id: string | null;
}

interface Organization {
  id: string;
  name: string;
  code: string;
}

interface UserOrganization {
  id: string;
  organization_id: string;
  role: AppRole;
  is_owner: boolean;
  organization: Organization;
}

type AppRole = "admin" | "gestor" | "usuario";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  organization: Organization | null;
  organizations: UserOrganization[];
  role: AppRole | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<UserOrganization[]>([]);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, email, active_organization_id")
        .eq("id", userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);

        // Fetch all user organizations
        const { data: userOrgs } = await supabase
          .from("user_organizations")
          .select(`
            id,
            organization_id,
            role,
            is_owner,
            organization:organizations(id, name, code)
          `)
          .eq("user_id", userId);

        if (userOrgs && userOrgs.length > 0) {
          const formattedOrgs = userOrgs.map(uo => ({
            id: uo.id,
            organization_id: uo.organization_id,
            role: uo.role as AppRole,
            is_owner: uo.is_owner,
            organization: uo.organization as unknown as Organization
          }));
          setOrganizations(formattedOrgs);

          // Set active organization
          const activeOrgId = profileData.active_organization_id;
          if (activeOrgId) {
            const activeUserOrg = formattedOrgs.find(uo => uo.organization_id === activeOrgId);
            if (activeUserOrg) {
              setOrganization(activeUserOrg.organization);
              setRole(activeUserOrg.role);
            } else {
              // Active org not in user's orgs, reset to first one
              const firstOrg = formattedOrgs[0];
              setOrganization(firstOrg.organization);
              setRole(firstOrg.role);
              // Update profile with first org
              await supabase
                .from("profiles")
                .update({ active_organization_id: firstOrg.organization_id })
                .eq("id", userId);
            }
          } else {
            // No active org set, use first one
            const firstOrg = formattedOrgs[0];
            setOrganization(firstOrg.organization);
            setRole(firstOrg.role);
            // Update profile with first org
            await supabase
              .from("profiles")
              .update({ active_organization_id: firstOrg.organization_id })
              .eq("id", userId);
          }
        } else {
          setOrganizations([]);
          setOrganization(null);
          setRole(null);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer data fetching to avoid deadlock
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setOrganization(null);
          setOrganizations([]);
          setRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setOrganization(null);
    setOrganizations([]);
    setRole(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  const switchOrganization = async (organizationId: string) => {
    if (!user) return;

    const userOrg = organizations.find(uo => uo.organization_id === organizationId);
    if (!userOrg) return;

    // Update profile with new active organization
    const { error } = await supabase
      .from("profiles")
      .update({ active_organization_id: organizationId })
      .eq("id", user.id);

    if (!error) {
      setOrganization(userOrg.organization);
      setRole(userOrg.role);
      setProfile(prev => prev ? { ...prev, active_organization_id: organizationId } : null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        organization,
        organizations,
        role,
        isLoading,
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
