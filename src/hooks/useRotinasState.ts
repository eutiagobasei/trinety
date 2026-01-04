import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem("trinity_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("trinity_session_id", sessionId);
    }
    return sessionId;
  }, []);

  const loadRotinas = useCallback(async () => {
    try {
      const sessionId = getSessionId();
      const { data, error } = await supabase
        .from("management_routines")
        .select("*")
        .eq("session_id", sessionId)
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
    }
  }, [getSessionId, toast]);

  const saveRotinas = useCallback(async (rotinasToSave: Rotinas) => {
    setSaving(true);
    try {
      const sessionId = getSessionId();

      const { data: existing } = await supabase
        .from("management_routines")
        .select("id")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("management_routines")
          .update({
            semanal: rotinasToSave.semanal,
            mensal: rotinasToSave.mensal,
            trimestral: rotinasToSave.trimestral,
            anual: rotinasToSave.anual,
          })
          .eq("session_id", sessionId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("management_routines")
          .insert({
            session_id: sessionId,
            semanal: rotinasToSave.semanal,
            mensal: rotinasToSave.mensal,
            trimestral: rotinasToSave.trimestral,
            anual: rotinasToSave.anual,
          });

        if (error) throw error;
      }
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
  }, [getSessionId, toast]);

  useEffect(() => {
    loadRotinas();
  }, [loadRotinas]);

  const updateField = useCallback((field: keyof Rotinas, value: string) => {
    setRotinas(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    if (loading) return;
    
    const timeoutId = setTimeout(() => {
      saveRotinas(rotinas);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [rotinas, loading, saveRotinas]);

  return {
    rotinas,
    updateField,
    loading,
    saving,
  };
};