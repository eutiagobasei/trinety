import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
  const { organization } = useAuth();
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
  const [recordId, setRecordId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!organization?.id) {
      setIsLoading(false);
      return;
    }

    const loadEmpathyMap = async () => {
      const { data, error } = await supabase
        .from("empathy_map")
        .select("*")
        .eq("organization_id", organization.id)
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
        setRecordId(data.id);
        setEmpathyMap({
          dores: data.dores || "",
          ganhos: data.ganhos || "",
          necessidades: data.necessidades || "",
          pensamentos: data.pensamentos || "",
          sentimentos: data.sentimentos || "",
          objecoes: data.objecoes || "",
        });
      } else {
        const { data: newRecord, error: insertError } = await supabase
          .from("empathy_map")
          .insert([{
            organization_id: organization.id,
            session_id: organization.id,
            dores: "",
            ganhos: "",
            necessidades: "",
            pensamentos: "",
            sentimentos: "",
            objecoes: "",
          }])
          .select()
          .single();

        if (insertError) {
          console.error("Error creating empathy map:", insertError);
        } else if (newRecord) {
          setRecordId(newRecord.id);
        }
      }

      setIsLoading(false);
    };

    loadEmpathyMap();
  }, [organization?.id, toast]);

  const saveEmpathyMap = useCallback(
    async (updatedMap: EmpathyMapData) => {
      if (!recordId) return;

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
        .eq("id", recordId);

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
    [recordId, toast]
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
