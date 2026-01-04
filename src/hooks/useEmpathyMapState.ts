import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmpathyMapData {
  dores: string;
  ganhos: string;
  necessidades: string;
  pensamentos: string;
  sentimentos: string;
  objecoes: string;
}

export const useEmpathyMapState = () => {
  const { toast } = useToast();
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
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const loadEmpathyMap = async () => {
      let storedSessionId = localStorage.getItem("trinity_session_id");
      
      if (!storedSessionId) {
        storedSessionId = crypto.randomUUID();
        localStorage.setItem("trinity_session_id", storedSessionId);
      }
      
      setSessionId(storedSessionId);

      const { data, error } = await supabase
        .from("empathy_map")
        .select("*")
        .eq("session_id", storedSessionId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading empathy map:", error);
        toast({
          title: "Erro ao carregar mapa",
          description: "Não foi possível carregar os dados salvos.",
          variant: "destructive",
        });
      }

      if (data) {
        setEmpathyMap({
          dores: data.dores || "",
          ganhos: data.ganhos || "",
          necessidades: data.necessidades || "",
          pensamentos: data.pensamentos || "",
          sentimentos: data.sentimentos || "",
          objecoes: data.objecoes || "",
        });
      } else {
        const { error: insertError } = await supabase
          .from("empathy_map")
          .insert({
            session_id: storedSessionId,
            dores: "",
            ganhos: "",
            necessidades: "",
            pensamentos: "",
            sentimentos: "",
            objecoes: "",
          });

        if (insertError) {
          console.error("Error creating empathy map:", insertError);
        }
      }

      setIsLoading(false);
    };

    loadEmpathyMap();
  }, [toast]);

  const saveEmpathyMap = useCallback(
    async (updatedMap: EmpathyMapData) => {
      if (!sessionId) return;

      setIsSaving(true);

      const { error } = await supabase
        .from("empathy_map")
        .update({
          dores: updatedMap.dores,
          ganhos: updatedMap.ganhos,
          necessidades: updatedMap.necessidades,
          pensamentos: updatedMap.pensamentos,
          sentimentos: updatedMap.sentimentos,
          objecoes: updatedMap.objecoes,
        })
        .eq("session_id", sessionId);

      if (error) {
        console.error("Error saving empathy map:", error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive",
        });
      }

      setIsSaving(false);
    },
    [sessionId, toast]
  );

  let saveTimeout: NodeJS.Timeout;
  const updateField = useCallback(
    (field: keyof EmpathyMapData, value: string) => {
      const updatedMap = { ...empathyMap, [field]: value };
      setEmpathyMap(updatedMap);

      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveEmpathyMap(updatedMap);
      }, 1000);
    },
    [empathyMap, saveEmpathyMap]
  );

  return {
    empathyMap,
    updateField,
    isLoading,
    isSaving,
  };
};
