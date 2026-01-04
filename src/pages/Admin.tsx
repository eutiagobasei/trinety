import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  Building2, 
  CreditCard, 
  BarChart3, 
  ArrowLeft,
  Search,
  Edit,
  Trash2,
  Crown
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

interface OrganizationData {
  id: string;
  name: string;
  code: string;
  created_at: string;
  member_count?: number;
}

interface SubscriptionData {
  id: string;
  user_id: string;
  status: string;
  trial_ends_at: string | null;
  created_at: string;
  plan: {
    name: string;
    slug: string;
  };
  profile?: {
    email: string | null;
    full_name: string | null;
  };
}

interface PlanData {
  id: string;
  name: string;
  slug: string;
  max_organizations: number;
  max_users_per_org: number;
  price_monthly: number;
  is_active: boolean;
}

export default function Admin() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("metrics");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Metrics
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchUsers(),
      fetchOrganizations(),
      fetchSubscriptions(),
      fetchPlans(),
    ]);
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
      setMetrics(prev => ({ ...prev, totalUsers: data.length }));
    }
  };

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, code, created_at")
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Get member counts for each org
      const orgsWithCounts = await Promise.all(
        data.map(async (org) => {
          const { count } = await supabase
            .from("user_organizations")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", org.id);
          return { ...org, member_count: count || 0 };
        })
      );
      setOrganizations(orgsWithCounts);
      setMetrics(prev => ({ ...prev, totalOrganizations: data.length }));
    }
  };

  const fetchSubscriptions = async () => {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        id,
        user_id,
        status,
        trial_ends_at,
        created_at,
        plan:plans(name, slug)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Fetch profile info for each subscription
      const subsWithProfiles = await Promise.all(
        data.map(async (sub) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", sub.user_id)
            .maybeSingle();
          return { 
            ...sub, 
            profile,
            plan: sub.plan as unknown as { name: string; slug: string }
          };
        })
      );
      setSubscriptions(subsWithProfiles);
      setMetrics(prev => ({
        ...prev,
        activeSubscriptions: data.filter(s => s.status === "active").length,
        trialUsers: data.filter(s => s.status === "trialing").length,
      }));
    }
  };

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("price_monthly", { ascending: true });

    if (!error && data) {
      setPlans(data);
    }
  };

  const updateSubscriptionStatus = async (subscriptionId: string, newStatus: string) => {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: newStatus })
      .eq("id", subscriptionId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a assinatura.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Assinatura atualizada com sucesso.",
      });
      fetchSubscriptions();
    }
  };

  const deleteOrganization = async (orgId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta organização? Esta ação não pode ser desfeita.")) {
      return;
    }

    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", orgId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a organização.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Organização excluída com sucesso.",
      });
      fetchOrganizations();
    }
  };

  const filteredUsers = users.filter(
    u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrganizations = organizations.filter(
    o => o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         o.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-xl font-bold">Admin do Sistema</h1>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Métricas
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="organizations" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Empresas
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Assinaturas
            </TabsTrigger>
          </TabsList>

          {/* Metrics Tab */}
          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total de Usuários</CardDescription>
                  <CardTitle className="text-3xl">{metrics.totalUsers}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total de Empresas</CardDescription>
                  <CardTitle className="text-3xl">{metrics.totalOrganizations}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Assinaturas Ativas</CardDescription>
                  <CardTitle className="text-3xl">{metrics.activeSubscriptions}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Em Trial</CardDescription>
                  <CardTitle className="text-3xl">{metrics.trialUsers}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Planos Disponíveis</CardTitle>
                  <CardDescription>Gerencie os planos do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Max Empresas</TableHead>
                        <TableHead>Max Usuários/Empresa</TableHead>
                        <TableHead>Preço Mensal</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">{plan.name}</TableCell>
                          <TableCell>{plan.slug}</TableCell>
                          <TableCell>{plan.max_organizations}</TableCell>
                          <TableCell>{plan.max_users_per_org}</TableCell>
                          <TableCell>R$ {plan.price_monthly}</TableCell>
                          <TableCell>
                            <Badge variant={plan.is_active ? "default" : "secondary"}>
                              {plan.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Usuários</CardTitle>
                    <CardDescription>Todos os usuários do sistema</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Criado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || "-"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Empresas</CardTitle>
                    <CardDescription>Todas as empresas cadastradas</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar empresas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Membros</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrganizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{org.code}</Badge>
                        </TableCell>
                        <TableCell>{org.member_count}</TableCell>
                        <TableCell>
                          {format(new Date(org.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteOrganization(org.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Assinaturas</CardTitle>
                <CardDescription>Gerenciar assinaturas dos usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Trial Expira</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">
                          {sub.profile?.full_name || "-"}
                        </TableCell>
                        <TableCell>{sub.profile?.email || "-"}</TableCell>
                        <TableCell>
                          <Badge>{sub.plan?.name}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              sub.status === "active" ? "default" :
                              sub.status === "trialing" ? "secondary" : "destructive"
                            }
                          >
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {sub.trial_ends_at
                            ? format(new Date(sub.trial_ends_at), "dd/MM/yyyy", { locale: ptBR })
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={sub.status}
                            onValueChange={(value) => updateSubscriptionStatus(sub.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="trialing">trialing</SelectItem>
                              <SelectItem value="active">active</SelectItem>
                              <SelectItem value="canceled">canceled</SelectItem>
                              <SelectItem value="expired">expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
