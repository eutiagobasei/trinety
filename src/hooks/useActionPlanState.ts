import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Action {
  id?: string;
  acao: string;
  origem: string;
  responsavel: string;
  prazo: string;
  status: string;
  obs: string;
}

export const useActionPlanState = () => {
  const [actions, setActions] = useState<Action[]>([
    { acao: "", origem: "", responsavel: "", prazo: "", status: "", obs: "" }
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

  const loadActions = useCallback(async () => {
    try {
      const sessionId = getSessionId();
      const { data, error } = await supabase
        .from("action_plan")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setActions(data.map(item => ({
          id: item.id,
          acao: item.acao || "",
          origem: item.origem || "",
          responsavel: item.responsavel || "",
          prazo: item.prazo || "",
          status: item.status || "",
          obs: item.obs || ""
        })));
      }
    } catch (error) {
      console.error("Error loading action plan:", error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar o plano de ação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [getSessionId, toast]);

  const saveActions = useCallback(async (actionsToSave: Action[]) => {
    setSaving(true);
    try {
      const sessionId = getSessionId();

      for (const action of actionsToSave) {
        if (action.id) {
          // Update existing
          const { error } = await supabase
            .from("action_plan")
            .update({
              acao: action.acao,
              origem: action.origem,
              responsavel: action.responsavel,
              prazo: action.prazo,
              status: action.status,
              obs: action.obs,
            })
            .eq("id", action.id);

          if (error) throw error;
        } else if (action.acao || action.origem || action.responsavel || action.prazo || action.status || action.obs) {
          // Insert new (only if has content)
          const { data, error } = await supabase
            .from("action_plan")
            .insert({
              session_id: sessionId,
              acao: action.acao,
              origem: action.origem,
              responsavel: action.responsavel,
              prazo: action.prazo,
              status: action.status,
              obs: action.obs,
            })
            .select()
            .single();

          if (error) throw error;
          action.id = data.id;
        }
      }
    } catch (error) {
      console.error("Error saving action plan:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o plano de ação.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [getSessionId, toast]);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  const updateAction = useCallback((index: number, field: keyof Action, value: string) => {
    setActions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const addAction = useCallback(() => {
    setActions(prev => [...prev, { acao: "", origem: "", responsavel: "", prazo: "", status: "", obs: "" }]);
  }, []);

  useEffect(() => {
    if (loading) return;
    
    const timeoutId = setTimeout(() => {
      saveActions(actions);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [actions, loading, saveActions]);

  return {
    actions,
    updateAction,
    addAction,
    loading,
    saving,
  };
};