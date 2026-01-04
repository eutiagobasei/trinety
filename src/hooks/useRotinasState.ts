import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Rotinas {
  semanal: string;
  mensal: string;
  trimestral: string;
  anual: string;
}

export const useRotinasState = () => {
  const [rotinas, setRotinas] = useState<Rotinas>({
    semanal: "",
    mensal: "",
    trimestral: "",
    anual: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { organization } = useAuth();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitialLoad = useRef(true);

  const loadRotinas = useCallback(async () => {
    if (!organization?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("management_routines")
        .select("*")
        .eq("organization_id", organization.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setRotinas({
          semanal: data.semanal || "",
          mensal: data.mensal || "",
          trimestral: data.trimestral || "",
          anual: data.anual || "",
        });
      }
    } catch (error) {
      console.error("Error loading rotinas:", error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as rotinas de gestão.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [organization?.id, toast]);

  const saveRotinas = useCallback(async (rotinasToSave: Rotinas) => {
    if (!organization?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("management_routines")
        .upsert(
          {
            organization_id: organization.id,
            session_id: organization.id,
            semanal: rotinasToSave.semanal,
            mensal: rotinasToSave.mensal,
            trimestral: rotinasToSave.trimestral,
            anual: rotinasToSave.anual,
          },
          {
            onConflict: "organization_id",
          }
        );

      if (error) throw error;
    } catch (error) {
      console.error("Error saving rotinas:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as rotinas de gestão.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [organization?.id, toast]);

  useEffect(() => {
    loadRotinas();
  }, [loadRotinas]);

  const updateField = useCallback((field: keyof Rotinas, value: string) => {
    setRotinas(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    if (loading || isInitialLoad.current) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveRotinas(rotinas);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [rotinas, loading, saveRotinas]);

  return {
    rotinas,
    updateField,
    loading,
    saving,
  };
};
