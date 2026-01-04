import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DEBOUNCE_MS = 1000; // Auto-save after 1 second of inactivity

export const useDiagnosticState = () => {
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Initialize or load existing diagnostic session
  useEffect(() => {
    const initDiagnostic = async () => {
      try {
        // Get or create session ID
        let storedSessionId = localStorage.getItem("diagnostic_session_id");
        
        if (!storedSessionId) {
          storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem("diagnostic_session_id", storedSessionId);
        }
        
        setSessionId(storedSessionId);

        // Try to load existing diagnostic
        const { data: existingDiagnostic, error: fetchError } = await supabase
          .from("diagnostics")
          .select("id")
          .eq("session_id", storedSessionId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching diagnostic:", fetchError);
          throw fetchError;
        }

        if (existingDiagnostic) {
          // Load existing diagnostic
          setDiagnosticId(existingDiagnostic.id);
          
          // Load answers
          const { data: answersData, error: answersError } = await supabase
            .from("diagnostic_answers")
            .select("*")
            .eq("diagnostic_id", existingDiagnostic.id);

          if (answersError) {
            console.error("Error loading answers:", answersError);
            throw answersError;
          }

          // Convert to answers object
          const loadedAnswers: { [key: string]: string } = {};
          answersData?.forEach((answer) => {
            const key = `${answer.block_index}-${answer.question_index}`;
            loadedAnswers[key] = answer.answer;
          });
          
          setAnswers(loadedAnswers);
        } else {
          // Create new diagnostic using upsert to avoid duplicate key errors
          const { data: newDiagnostic, error: createError } = await supabase
            .from("diagnostics")
            .upsert(
              { session_id: storedSessionId },
              { onConflict: "session_id" }
            )
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
  }, [toast]);

  // Auto-save answer to database
  const saveAnswer = useCallback(
    async (blockIndex: number, questionIndex: number, answer: string) => {
      if (!diagnosticId) return;

      try {
        setIsSaving(true);
        
        const { error } = await supabase
          .from("diagnostic_answers")
          .upsert(
            {
              diagnostic_id: diagnosticId,
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
    [diagnosticId, toast]
  );

  // Update answer with debounced auto-save
  const updateAnswer = useCallback(
    (blockIndex: number, questionIndex: number, value: string) => {
      const key = `${blockIndex}-${questionIndex}`;
      
      // Update local state immediately
      setAnswers((prev) => ({ ...prev, [key]: value }));

      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for auto-save
      saveTimeoutRef.current = setTimeout(() => {
        saveAnswer(blockIndex, questionIndex, value);
      }, DEBOUNCE_MS);
    },
    [saveAnswer]
  );

  // Mark diagnostic as completed
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

  // Calculate progress
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
    sessionId,
  };
};
