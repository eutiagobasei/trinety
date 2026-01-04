import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface OkrsState {
  objetivo: string;
  krs: string;
}

export const useOkrsState = () => {
  const [okrs, setOkrs] = useState<OkrsState>({
    objetivo: "",
    krs: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { organization } = useAuth();

  useEffect(() => {
    if (!organization?.id) {
      setIsLoading(false);
      return;
    }

    const loadOkrs = async () => {
      try {
        const { data, error } = await supabase
          .from("okrs")
          .select("*")
          .eq("organization_id", organization.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setOkrs({
            objetivo: data.objetivo || "",
            krs: data.krs || "",
          });
        }
      } catch (error) {
        console.error("Error loading OKRs:", error);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar os OKRs salvos.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOkrs();
  }, [organization?.id, toast]);

  const saveOkrs = useCallback(
    async (newOkrs: OkrsState) => {
      if (!organization?.id) return;

      try {
        setIsSaving(true);

        const { error } = await supabase
          .from("okrs")
          .upsert(
            {
              organization_id: organization.id,
              session_id: organization.id,
              objetivo: newOkrs.objetivo,
              krs: newOkrs.krs,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "organization_id",
            }
          );

        if (error) throw error;
      } catch (error) {
        console.error("Error saving OKRs:", error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar os OKRs.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [organization?.id, toast]
  );

  const updateOkrs = useCallback(
    (field: keyof OkrsState, value: string) => {
      const newOkrs = { ...okrs, [field]: value };
      setOkrs(newOkrs);

      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(() => {
        saveOkrs(newOkrs);
      }, 1000);

      setSaveTimeout(timeout);
    },
    [okrs, saveTimeout, saveOkrs]
  );

  return {
    okrs,
    updateOkrs,
    isLoading,
    isSaving,
  };
};
