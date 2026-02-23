import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

export interface Rotinas {
  semanal: string;
  mensal: string;
  trimestral: string;
  anual: string;
}

const DEBOUNCE_MS = 1000;

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
  const { organization } = useOrganization();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitialLoad = useRef(true);

  const loadRotinas = useCallback(async () => {
    if (!organization?.id) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiClient.get<Rotinas>(
        `/organizations/${organization.id}/strategic-planning/routines`
      );

      setRotinas({
        semanal: data.semanal || "",
        mensal: data.mensal || "",
        trimestral: data.trimestral || "",
        anual: data.anual || "",
      });
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
      await apiClient.put(
        `/organizations/${organization.id}/strategic-planning/routines`,
        rotinasToSave
      );
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
    }, DEBOUNCE_MS);

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
