import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

interface OkrsState {
  objetivo: string;
  krs: string;
}

const DEBOUNCE_MS = 1000;

export const useOkrsState = () => {
  const [okrs, setOkrs] = useState<OkrsState>({
    objetivo: "",
    krs: "",
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

    const loadOkrs = async () => {
      try {
        const data = await apiClient.get<OkrsState[]>(
          `/organizations/${organization.id}/strategic-planning/okrs`
        );

        // Backend returns array, we use first item or empty
        if (data && data.length > 0) {
          setOkrs({
            objetivo: data[0].objetivo || "",
            krs: data[0].krs || "",
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
  }, [organization?.id, toast]);

  const saveOkrs = useCallback(
    async (newOkrs: OkrsState) => {
      if (!organization?.id) return;

      try {
        setIsSaving(true);

        // Backend expects array, send single item as array
        await apiClient.put(
          `/organizations/${organization.id}/strategic-planning/okrs`,
          [newOkrs]
        );
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
    [organization?.id, toast]
  );

  const updateOkrs = useCallback(
    (field: keyof OkrsState, value: string) => {
      setOkrs((prev) => {
        const newOkrs = { ...prev, [field]: value };

        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
          saveOkrs(newOkrs);
        }, DEBOUNCE_MS);

        return newOkrs;
      });
    },
    [saveOkrs]
  );

  return {
    okrs,
    updateOkrs,
    isLoading,
    isSaving,
  };
};
