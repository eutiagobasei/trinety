import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SwotState {
  forcas: string;
  fraquezas: string;
  oportunidades: string;
  ameacas: string;
  combinacoes: string;
}

export const useSwotState = () => {
  const { toast } = useToast();
  const [swot, setSwot] = useState<SwotState>({
    forcas: "",
    fraquezas: "",
    oportunidades: "",
    ameacas: "",
    combinacoes: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Get or create session ID
  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem("trinity_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("trinity_session_id", sessionId);
    }
    return sessionId;
  }, []);

  // Load existing data
  useEffect(() => {
    const loadSwot = async () => {
      try {
        const sessionId = getSessionId();
        const { data, error } = await supabase
          .from("swot_analysis")
          .select("*")
          .eq("session_id", sessionId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSwot({
            forcas: data.forcas || "",
            fraquezas: data.fraquezas || "",
            oportunidades: data.oportunidades || "",
            ameacas: data.ameacas || "",
            combinacoes: data.combinacoes || "",
          });
        }
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
  }, [getSessionId, toast]);

  // Save to database with debounce
  const saveToDatabase = useCallback(
    async (data: SwotState) => {
      try {
        setIsSaving(true);
        const sessionId = getSessionId();

        const { error } = await supabase
          .from("swot_analysis")
          .upsert(
            {
              session_id: sessionId,
              forcas: data.forcas,
              fraquezas: data.fraquezas,
              oportunidades: data.oportunidades,
              ameacas: data.ameacas,
              combinacoes: data.combinacoes,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "session_id",
            }
          );

        if (error) throw error;
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
    [getSessionId, toast]
  );

  // Update state and trigger debounced save
  const updateSwot = useCallback(
    (field: keyof SwotState, value: string) => {
      const newSwot = { ...swot, [field]: value };
      setSwot(newSwot);

      // Clear existing timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Set new timeout for debounced save (1 second)
      const timeout = setTimeout(() => {
        saveToDatabase(newSwot);
      }, 1000);

      setSaveTimeout(timeout);
    },
    [swot, saveTimeout, saveToDatabase]
  );

  return {
    swot,
    updateSwot,
    isLoading,
    isSaving,
  };
};
