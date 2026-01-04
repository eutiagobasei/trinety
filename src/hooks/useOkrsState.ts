import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem("trinity_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem("trinity_session_id", sessionId);
    }
    return sessionId;
  }, []);

  useEffect(() => {
    const loadOkrs = async () => {
      try {
        const sessionId = getSessionId();
        const { data, error } = await supabase
          .from("okrs")
          .select("*")
          .eq("session_id", sessionId)
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
  }, [getSessionId, toast]);

  const saveOkrs = useCallback(
    async (newOkrs: OkrsState) => {
      try {
        setIsSaving(true);
        const sessionId = getSessionId();

        const { data: existing } = await supabase
          .from("okrs")
          .select("id")
          .eq("session_id", sessionId)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from("okrs")
            .update({
              objetivo: newOkrs.objetivo,
              krs: newOkrs.krs,
              updated_at: new Date().toISOString(),
            })
            .eq("session_id", sessionId);

          if (error) throw error;
        } else {
          const { error } = await supabase.from("okrs").insert({
            session_id: sessionId,
            objetivo: newOkrs.objetivo,
            krs: newOkrs.krs,
          });

          if (error) throw error;
        }
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
    [getSessionId, toast]
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
