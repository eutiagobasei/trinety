import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface FilosofiaState {
  visao: string;
  missao: string;
  valores: string;
}

export const useFilosofiaState = () => {
  const [filosofia, setFilosofia] = useState<FilosofiaState>({
    visao: "",
    missao: "",
    valores: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { organization } = useAuth();

  useEffect(() => {
    if (!organization?.id) {
      setIsLoading(false);
      return;
    }

    const loadFilosofia = async () => {
      try {
        const { data, error } = await supabase
          .from("filosofia")
          .select("*")
          .eq("organization_id", organization.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setFilosofia({
            visao: data.visao || "",
            missao: data.missao || "",
            valores: data.valores || "",
          });
        }
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

  const saveFilosofia = useCallback(async (data: FilosofiaState) => {
    if (!organization?.id) return;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from("filosofia")
        .upsert(
          {
            organization_id: organization.id,
            session_id: organization.id,
            ...data,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "organization_id",
          }
        );

      if (error) throw error;
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
  }, [organization?.id, toast]);

  const updateFilosofia = useCallback((field: keyof FilosofiaState, value: string) => {
    setFilosofia((prev) => {
      const newState = { ...prev, [field]: value };
      
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(() => {
        saveFilosofia(newState);
      }, 1000);

      setSaveTimeout(timeout);

      return newState;
    });
  }, [saveTimeout, saveFilosofia]);

  return {
    filosofia,
    updateFilosofia,
    isLoading,
    isSaving,
  };
};
