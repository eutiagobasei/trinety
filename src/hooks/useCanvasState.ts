import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

const DEBOUNCE_MS = 1000;

export interface CanvasData {
  segmentos: string;
  proposta: string;
  canais: string;
  relacionamento: string;
  atividades: string;
  recursos: string;
  parceiros: string;
  custos: string;
  receitas: string;
}

export const useCanvasState = () => {
  const [canvas, setCanvas] = useState<CanvasData>({
    segmentos: "",
    proposta: "",
    canais: "",
    relacionamento: "",
    atividades: "",
    recursos: "",
    parceiros: "",
    custos: "",
    receitas: ""
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

    const initCanvas = async () => {
      try {
        const data = await apiClient.get<CanvasData>(
          `/organizations/${organization.id}/strategic-planning/canvas`
        );

        setCanvas({
          segmentos: data.segmentos || "",
          proposta: data.proposta || "",
          canais: data.canais || "",
          relacionamento: data.relacionamento || "",
          atividades: data.atividades || "",
          recursos: data.recursos || "",
          parceiros: data.parceiros || "",
          custos: data.custos || "",
          receitas: data.receitas || ""
        });
      } catch (error) {
        console.error("Failed to initialize canvas:", error);
        toast({
          title: "Erro ao carregar canvas",
          description: "Não foi possível carregar seu canvas. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initCanvas();
  }, [organization?.id, toast]);

  const saveCanvas = useCallback(
    async (updatedCanvas: CanvasData) => {
      if (!organization?.id) return;

      try {
        setIsSaving(true);

        await apiClient.put(
          `/organizations/${organization.id}/strategic-planning/canvas`,
          updatedCanvas
        );
      } catch (error) {
        console.error("Failed to save canvas:", error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar o canvas. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [organization?.id, toast]
  );

  const updateField = useCallback(
    (field: keyof CanvasData, value: string) => {
      setCanvas((prev) => {
        const updated = { ...prev, [field]: value };

        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
          saveCanvas(updated);
        }, DEBOUNCE_MS);

        return updated;
      });
    },
    [saveCanvas]
  );

  return {
    canvas,
    updateField,
    isLoading,
    isSaving,
  };
};
