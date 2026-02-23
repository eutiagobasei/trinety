import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

export interface Indicator {
  id?: string;
  nome: string;
  descricao: string;
  meta: string;
  origem: string;
  mensal: string;
}

const DEBOUNCE_MS = 1000;

export const useIndicadoresState = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([
    { nome: "", descricao: "", meta: "", origem: "", mensal: "" }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { organization } = useOrganization();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitialLoad = useRef(true);

  const loadIndicators = useCallback(async () => {
    if (!organization?.id) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiClient.get<Indicator[]>(
        `/organizations/${organization.id}/strategic-planning/indicators`
      );

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
      isInitialLoad.current = false;
    }
  }, [organization?.id, toast]);

  const saveIndicators = useCallback(async (indicatorsToSave: Indicator[]) => {
    if (!organization?.id) return;

    setSaving(true);
    try {
      const response = await apiClient.put<Indicator[]>(
        `/organizations/${organization.id}/strategic-planning/indicators`,
        indicatorsToSave
      );

      if (response && response.length > 0) {
        setIndicators(response.map(item => ({
          id: item.id,
          nome: item.nome || "",
          descricao: item.descricao || "",
          meta: item.meta || "",
          origem: item.origem || "",
          mensal: item.mensal || ""
        })));
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
  }, [organization?.id, toast]);

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
    if (loading || isInitialLoad.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveIndicators(indicators);
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [indicators, loading, saveIndicators]);

  return {
    indicators,
    updateIndicator,
    addIndicator,
    loading,
    saving,
  };
};
