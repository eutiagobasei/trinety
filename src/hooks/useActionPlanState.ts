import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useOrganization } from "@/hooks/useOrganization";
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

const DEBOUNCE_MS = 1000;

export const useActionPlanState = () => {
  const [actions, setActions] = useState<Action[]>([
    { acao: "", origem: "", responsavel: "", prazo: "", status: "", obs: "" }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { organization } = useOrganization();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitialLoad = useRef(true);

  const loadActions = useCallback(async () => {
    if (!organization?.id) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiClient.get<Action[]>(
        `/organizations/${organization.id}/strategic-planning/action-plan`
      );

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
      isInitialLoad.current = false;
    }
  }, [organization?.id, toast]);

  const saveActions = useCallback(async (actionsToSave: Action[]) => {
    if (!organization?.id) return;

    setSaving(true);
    try {
      const response = await apiClient.put<Action[]>(
        `/organizations/${organization.id}/strategic-planning/action-plan`,
        actionsToSave
      );

      if (response && response.length > 0) {
        setActions(response.map(item => ({
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
      console.error("Error saving action plan:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o plano de ação.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [organization?.id, toast]);

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
    if (loading || isInitialLoad.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveActions(actions);
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [actions, loading, saveActions]);

  return {
    actions,
    updateAction,
    addAction,
    loading,
    saving,
  };
};
