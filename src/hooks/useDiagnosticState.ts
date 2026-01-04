import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const DEBOUNCE_MS = 1000;

export const useDiagnosticState = () => {
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
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

    const initDiagnostic = async () => {
      try {
        const { data: existingDiagnostic, error: fetchError } = await supabase
          .from("diagnostics")
          .select("id")
          .eq("organization_id", organization.id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching diagnostic:", fetchError);
          throw fetchError;
        }

        if (existingDiagnostic) {
          setDiagnosticId(existingDiagnostic.id);
          
          const { data: answersData, error: answersError } = await supabase
            .from("diagnostic_answers")
            .select("*")
            .eq("diagnostic_id", existingDiagnostic.id);

          if (answersError) {
            console.error("Error loading answers:", answersError);
            throw answersError;
          }

          const loadedAnswers: { [key: string]: string } = {};
          answersData?.forEach((answer) => {
            const key = `${answer.block_index}-${answer.question_index}`;
            loadedAnswers[key] = answer.answer;
          });
          
          setAnswers(loadedAnswers);
        } else {
          const { data: newDiagnostic, error: createError } = await supabase
            .from("diagnostics")
            .insert([{ 
              organization_id: organization.id,
              session_id: organization.id 
            }])
            .select()
            .single();

          if (createError) {
            console.error("Error creating diagnostic:", createError);
            throw createError;
          }

          setDiagnosticId(newDiagnostic.id);
        }
      } catch (error) {
        console.error("Failed to initialize diagnostic:", error);
        toast({
          title: "Erro ao carregar diagnóstico",
          description: "Não foi possível carregar seu progresso. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initDiagnostic();
  }, [organization?.id, toast]);

  const saveAnswer = useCallback(
    async (blockIndex: number, questionIndex: number, answer: string) => {
      if (!diagnosticId || !organization?.id) return;

      try {
        setIsSaving(true);
        
        const { error } = await supabase
          .from("diagnostic_answers")
          .upsert(
            {
              diagnostic_id: diagnosticId,
              organization_id: organization.id,
              block_index: blockIndex,
              question_index: questionIndex,
              answer: answer,
            },
            {
              onConflict: "diagnostic_id,block_index,question_index",
            }
          );

        if (error) {
          console.error("Error saving answer:", error);
          throw error;
        }
      } catch (error) {
        console.error("Failed to save answer:", error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar sua resposta. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [diagnosticId, organization?.id, toast]
  );

  const updateAnswer = useCallback(
    (blockIndex: number, questionIndex: number, value: string) => {
      const key = `${blockIndex}-${questionIndex}`;
      
      setAnswers((prev) => ({ ...prev, [key]: value }));

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveAnswer(blockIndex, questionIndex, value);
      }, DEBOUNCE_MS);
    },
    [saveAnswer]
  );

  const completeDiagnostic = useCallback(async () => {
    if (!diagnosticId) return;

    try {
      const { error } = await supabase
        .from("diagnostics")
        .update({ completed: true })
        .eq("id", diagnosticId);

      if (error) {
        console.error("Error completing diagnostic:", error);
        throw error;
      }
    } catch (error) {
      console.error("Failed to complete diagnostic:", error);
      toast({
        title: "Erro ao finalizar",
        description: "Não foi possível finalizar o diagnóstico. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [diagnosticId, toast]);

  const calculateProgress = useCallback((totalQuestions: number) => {
    const answeredCount = Object.values(answers).filter(
      (answer) => answer && answer.trim().length > 0
    ).length;
    return Math.round((answeredCount / totalQuestions) * 100);
  }, [answers]);

  return {
    answers,
    updateAnswer,
    completeDiagnostic,
    calculateProgress,
    isLoading,
    isSaving,
  };
};
