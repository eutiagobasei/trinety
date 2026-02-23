import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Construction } from "lucide-react";

interface InviteModalProps {
  children: React.ReactNode;
}

export function InviteModal({ children }: InviteModalProps) {
  const { organization } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Convidar Membros
          </DialogTitle>
          <DialogDescription>
            Convide pessoas para {organization?.name || "sua organizacao"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-8 text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <Construction className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Em Breve</h3>
          <p className="text-sm text-muted-foreground">
            O sistema de convites esta em desenvolvimento e estara disponivel em breve.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
