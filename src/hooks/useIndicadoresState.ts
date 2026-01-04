import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Indicator {
  id?: string;
  nome: string;
  descricao: string;
  meta: string;
  origem: string;
  mensal: string;
}

export const useIndicadoresState = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([
    { nome: "", descricao: "", meta: "", origem: "", mensal: "" }
  ]);
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

  const loadIndicators = useCallback(async () => {
    try {
      const sessionId = getSessionId();
      const { data, error } = await supabase
        .from("indicators")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setIndicators(data.map(item => ({
          id: item.id,
          nome: item.nome || "",
          descricao: item.descricao || "",
          meta: item.meta || "",
          origem: item.origem || "",
          mensal: item.mensal || ""
        })));
      }
    } catch (error) {
      console.error("Error loading indicators:", error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar os indicadores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [getSessionId, toast]);

  const saveIndicators = useCallback(async (indicatorsToSave: Indicator[]) => {
    setSaving(true);
    try {
      const sessionId = getSessionId();

      for (const indicator of indicatorsToSave) {
        if (indicator.id) {
          // Update existing
          const { error } = await supabase
            .from("indicators")
            .update({
              nome: indicator.nome,
              descricao: indicator.descricao,
              meta: indicator.meta,
              origem: indicator.origem,
              mensal: indicator.mensal,
            })
            .eq("id", indicator.id);

          if (error) throw error;
        } else if (indicator.nome || indicator.descricao || indicator.meta || indicator.origem || indicator.mensal) {
          // Insert new (only if has content)
          const { data, error } = await supabase
            .from("indicators")
            .insert({
              session_id: sessionId,
              nome: indicator.nome,
              descricao: indicator.descricao,
              meta: indicator.meta,
              origem: indicator.origem,
              mensal: indicator.mensal,
            })
            .select()
            .single();

          if (error) throw error;
          indicator.id = data.id;
        }
      }
    } catch (error) {
      console.error("Error saving indicators:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os indicadores.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [getSessionId, toast]);

  useEffect(() => {
    loadIndicators();
  }, [loadIndicators]);

  const updateIndicator = useCallback((index: number, field: keyof Indicator, value: string) => {
    setIndicators(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const addIndicator = useCallback(() => {
    setIndicators(prev => [...prev, { nome: "", descricao: "", meta: "", origem: "", mensal: "" }]);
  }, []);

  useEffect(() => {
    if (loading) return;
    
    const timeoutId = setTimeout(() => {
      saveIndicators(indicators);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [indicators, loading, saveIndicators]);

  return {
    indicators,
    updateIndicator,
    addIndicator,
    loading,
    saving,
  };
};