import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

interface FilosofiaState {
  visao: string;
  missao: string;
  valores: string;
}

const DEBOUNCE_MS = 1000;

export const useFilosofiaState = () => {
  const [filosofia, setFilosofia] = useState<FilosofiaState>({
    visao: "",
    missao: "",
    valores: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const { organization } = useOrganization();

  useEffect(() => {
    if (!organization?.id) {
      setIsLoading(false);
      return;
    }

    const loadFilosofia = async () => {
      try {
        const data = await apiClient.get<FilosofiaState>(
          `/organizations/${organization.id}/strategic-planning/filosofia`
        );

        setFilosofia({
          visao: data.visao || "",
          missao: data.missao || "",
          valores: data.valores || "",
        });
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

    loadFilosofia();
  }, [organization?.id, toast]);

  const saveFilosofia = useCallback(
    async (data: FilosofiaState) => {
      if (!organization?.id) return;

      try {
        setIsSaving(true);

        await apiClient.put(
          `/organizations/${organization.id}/strategic-planning/filosofia`,
          data
        );
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
    },
    [organization?.id, toast]
  );

  const updateFilosofia = useCallback(
    (field: keyof FilosofiaState, value: string) => {
      setFilosofia((prev) => {
        const newState = { ...prev, [field]: value };

        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
          saveFilosofia(newState);
        }, DEBOUNCE_MS);

        return newState;
      });
    },
    [saveFilosofia]
  );

  return {
    filosofia,
    updateFilosofia,
    isLoading,
    isSaving,
  };
};
