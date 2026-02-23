import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

interface EmpathyMapData {
  dores: string;
  ganhos: string;
  necessidades: string;
  pensamentos: string;
  sentimentos: string;
  objecoes: string;
}

const DEBOUNCE_MS = 1000;

export const useEmpathyMapState = () => {
  const { toast } = useToast();
  const { organization } = useOrganization();
  const [empathyMap, setEmpathyMap] = useState<EmpathyMapData>({
    dores: "",
    ganhos: "",
    necessidades: "",
    pensamentos: "",
    sentimentos: "",
    objecoes: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!organization?.id) {
      setIsLoading(false);
      return;
    }

    const loadEmpathyMap = async () => {
      try {
        const data = await apiClient.get<EmpathyMapData>(
          `/organizations/${organization.id}/strategic-planning/empathy-map`
        );

        setEmpathyMap({
          dores: data.dores || "",
          ganhos: data.ganhos || "",
          necessidades: data.necessidades || "",
          pensamentos: data.pensamentos || "",
          sentimentos: data.sentimentos || "",
          objecoes: data.objecoes || "",
        });
      } catch (error) {
        console.error("Error loading empathy map:", error);
        toast({
          title: "Erro ao carregar mapa",
          description: "Não foi possível carregar os dados salvos.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEmpathyMap();
  }, [organization?.id, toast]);

  const saveEmpathyMap = useCallback(
    async (updatedMap: EmpathyMapData) => {
      if (!organization?.id) return;

      setIsSaving(true);

      try {
        await apiClient.put(
          `/organizations/${organization.id}/strategic-planning/empathy-map`,
          updatedMap
        );
      } catch (error) {
        console.error("Error saving empathy map:", error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [organization?.id, toast]
  );

  const updateField = useCallback(
    (field: keyof EmpathyMapData, value: string) => {
      setEmpathyMap((prev) => {
        const updated = { ...prev, [field]: value };

        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
          saveEmpathyMap(updated);
        }, DEBOUNCE_MS);

        return updated;
      });
    },
    [saveEmpathyMap]
  );

  return {
    empathyMap,
    updateField,
    isLoading,
    isSaving,
  };
};
