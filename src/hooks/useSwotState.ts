import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

interface SwotState {
  forcas: string;
  fraquezas: string;
  oportunidades: string;
  ameacas: string;
  combinacoes: string;
}

const DEBOUNCE_MS = 1000;

export const useSwotState = () => {
  const { toast } = useToast();
  const { organization } = useOrganization();
  const [swot, setSwot] = useState<SwotState>({
    forcas: "",
    fraquezas: "",
    oportunidades: "",
    ameacas: "",
    combinacoes: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!organization?.id) {
      setIsLoading(false);
      return;
    }

    const loadSwot = async () => {
      try {
        const data = await apiClient.get<SwotState>(
          `/organizations/${organization.id}/strategic-planning/swot`
        );

        setSwot({
          forcas: data.forcas || "",
          fraquezas: data.fraquezas || "",
          oportunidades: data.oportunidades || "",
          ameacas: data.ameacas || "",
          combinacoes: data.combinacoes || "",
        });
      } catch (error) {
        console.error("Error loading SWOT:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar a análise SWOT.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSwot();
  }, [organization?.id, toast]);

  const saveToDatabase = useCallback(
    async (data: SwotState) => {
      if (!organization?.id) return;

      try {
        setIsSaving(true);

        await apiClient.put(
          `/organizations/${organization.id}/strategic-planning/swot`,
          data
        );
      } catch (error) {
        console.error("Error saving SWOT:", error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar a análise SWOT.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [organization?.id, toast]
  );

  const updateSwot = useCallback(
    (field: keyof SwotState, value: string) => {
      setSwot((prev) => {
        const newSwot = { ...prev, [field]: value };

        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
          saveToDatabase(newSwot);
        }, DEBOUNCE_MS);

        return newSwot;
      });
    },
    [saveToDatabase]
  );

  return {
    swot,
    updateSwot,
    isLoading,
    isSaving,
  };
};
