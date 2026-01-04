import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Copy, Check, Trash2, Link as LinkIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Invite {
  id: string;
  token: string;
  email: string | null;
  role: string;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
}

interface InviteModalProps {
  children: React.ReactNode;
}

export function InviteModal({ children }: InviteModalProps) {
  const { organization, user } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"gestor" | "usuario">("usuario");

  const loadInvites = async () => {
    if (!organization) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("organization_invites")
        .select("*")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error("Error loading invites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadInvites();
    }
  }, [open, organization]);

  const generateInviteLink = async () => {
    if (!organization || !user) return;

    setIsCreating(true);
    try {
      // Generate token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc("generate_invite_token");

      if (tokenError) throw tokenError;

      // Calculate expiry (7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Create invite
      const { data, error } = await supabase
        .from("organization_invites")
        .insert({
          organization_id: organization.id,
          email: email.trim() || null,
          token: tokenData,
          role: role,
          invited_by: user.id,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Copy link to clipboard
      const link = `${window.location.origin}/convite/${data.token}`;
      await navigator.clipboard.writeText(link);
      setCopiedId(data.id);
      setTimeout(() => setCopiedId(null), 2000);

      toast({
        title: "Link criado e copiado!",
        description: email 
          ? `Convite para ${email} copiado para a área de transferência.`
          : "Link de convite copiado para a área de transferência.",
      });

      // Reset form and reload
      setEmail("");
      setRole("usuario");
      loadInvites();
    } catch (error) {
      console.error("Error creating invite:", error);
      toast({
        title: "Erro ao criar convite",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = async (invite: Invite) => {
    const link = `${window.location.origin}/convite/${invite.token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(invite.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "Link copiado!",
    });
  };

  const deleteInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from("organization_invites")
        .delete()
        .eq("id", inviteId);

      if (error) throw error;

      toast({
        title: "Convite removido",
      });
      loadInvites();
    } catch (error) {
      console.error("Error deleting invite:", error);
      toast({
        title: "Erro ao remover convite",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isExpired = (dateStr: string) => new Date(dateStr) < new Date();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Convidar Membros
          </DialogTitle>
          <DialogDescription>
            Gere links de convite para adicionar pessoas à {organization?.name}
          </DialogDescription>
        </DialogHeader>

        {/* Create new invite */}
        <div className="space-y-4 py-4 border-b">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email (opcional)</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Cargo</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "gestor" | "usuario")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usuario">Usuário</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={generateInviteLink} disabled={isCreating} className="w-full">
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <LinkIcon className="mr-2 h-4 w-4" />
                Gerar Link de Convite
              </>
            )}
          </Button>
        </div>

        {/* Existing invites */}
        <div className="space-y-2">
          <Label>Convites Pendentes</Label>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invites.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Nenhum convite pendente.
            </p>
          ) : (
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {invites.map((invite) => {
                  const expired = isExpired(invite.expires_at);
                  const accepted = !!invite.accepted_at;
                  
                  return (
                    <div
                      key={invite.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        accepted 
                          ? "bg-green-50 border-green-200 dark:bg-green-950/20" 
                          : expired 
                            ? "bg-muted/50 opacity-60" 
                            : "bg-muted/30"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {invite.email || "Link genérico"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {invite.role} • {accepted ? "Aceito" : expired ? "Expirado" : `Expira em ${formatDate(invite.expires_at)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {!accepted && !expired && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyLink(invite)}
                          >
                            {copiedId === invite.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {!accepted && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteInvite(invite.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
