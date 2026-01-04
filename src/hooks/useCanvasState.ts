import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [canvasId, setCanvasId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
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

  // Initialize or load existing canvas
  useEffect(() => {
    const initCanvas = async () => {
      try {
        // Get or create session ID
        let storedSessionId = localStorage.getItem("diagnostic_session_id");
        
        if (!storedSessionId) {
          storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem("diagnostic_session_id", storedSessionId);
        }
        
        setSessionId(storedSessionId);

        // Try to load existing canvas
        const { data: existingCanvas, error: fetchError } = await supabase
          .from("business_model_canvas")
          .select("*")
          .eq("session_id", storedSessionId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching canvas:", fetchError);
          throw fetchError;
        }

        if (existingCanvas) {
          // Load existing canvas
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
          // Create new canvas
          const { data: newCanvas, error: createError } = await supabase
            .from("business_model_canvas")
            .insert({ session_id: storedSessionId })
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
  }, [toast]);

  // Auto-save canvas to database
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

  // Update field with debounced auto-save
  const updateField = useCallback(
    (field: keyof CanvasData, value: string) => {
      // Update local state immediately
      setCanvas((prev) => {
        const updated = { ...prev, [field]: value };
        
        // Clear previous timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for auto-save
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
