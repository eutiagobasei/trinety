import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FilosofiaState {
  visao: string;
  missao: string;
  valores: string;
}

export const useFilosofiaState = () => {
  const [filosofia, setFilosofia] = useState<FilosofiaState>({
    visao: "",
    missao: "",
    valores: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const getSessionId = () => {
    let sessionId = localStorage.getItem("trinity_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("trinity_session_id", sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    loadFilosofia();
  }, []);

  const loadFilosofia = async () => {
    try {
      const sessionId = getSessionId();
      const { data, error } = await supabase
        .from("filosofia")
        .select("*")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFilosofia({
          visao: data.visao || "",
          missao: data.missao || "",
          valores: data.valores || "",
        });
      }
    } catch (error) {
      console.error("Error loading filosofia:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a filosofia.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveFilosofia = async (data: FilosofiaState) => {
    try {
      setIsSaving(true);
      const sessionId = getSessionId();

      const { data: existing } = await supabase
        .from("filosofia")
        .select("id")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("filosofia")
          .update(data)
          .eq("session_id", sessionId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("filosofia")
          .insert([{ ...data, session_id: sessionId }]);

        if (error) throw error;
      }
    } catch (error) {
      console.error("Error saving filosofia:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateFilosofia = useCallback((field: keyof FilosofiaState, value: string) => {
    setFilosofia((prev) => {
      const newState = { ...prev, [field]: value };
      
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(() => {
        saveFilosofia(newState);
      }, 1000);

      setSaveTimeout(timeout);

      return newState;
    });
  }, [saveTimeout]);

  return {
    filosofia,
    updateFilosofia,
    isLoading,
    isSaving,
  };
};
