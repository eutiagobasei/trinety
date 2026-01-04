import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
  const [canvasId, setCanvasId] = useState<string | null>(null);
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
  const { organization } = useAuth();

  useEffect(() => {
    if (!organization?.id) {
      setIsLoading(false);
      return;
    }

    const initCanvas = async () => {
      try {
        const { data: existingCanvas, error: fetchError } = await supabase
          .from("business_model_canvas")
          .select("*")
          .eq("organization_id", organization.id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching canvas:", fetchError);
          throw fetchError;
        }

        if (existingCanvas) {
          setCanvasId(existingCanvas.id);
          setCanvas({
            segmentos: existingCanvas.segmentos || "",
            proposta: existingCanvas.proposta || "",
            canais: existingCanvas.canais || "",
            relacionamento: existingCanvas.relacionamento || "",
            atividades: existingCanvas.atividades || "",
            recursos: existingCanvas.recursos || "",
            parceiros: existingCanvas.parceiros || "",
            custos: existingCanvas.custos || "",
            receitas: existingCanvas.receitas || ""
          });
        } else {
          const { data: newCanvas, error: createError } = await supabase
            .from("business_model_canvas")
            .insert([{ 
              organization_id: organization.id,
              session_id: organization.id 
            }])
            .select()
            .single();

          if (createError) {
            console.error("Error creating canvas:", createError);
            throw createError;
          }

          setCanvasId(newCanvas.id);
        }
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
      if (!canvasId) return;

      try {
        setIsSaving(true);
        
        const { error } = await supabase
          .from("business_model_canvas")
          .update(updatedCanvas)
          .eq("id", canvasId);

        if (error) {
          console.error("Error saving canvas:", error);
          throw error;
        }
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
    [canvasId, toast]
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
