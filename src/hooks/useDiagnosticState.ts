import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

const DEBOUNCE_MS = 1000;

interface DiagnosticData {
  id: string;
  sessionId: string;
  completed: boolean;
}

interface AnswerData {
  id: string;
  blockIndex: number;
  questionIndex: number;
  answer: string;
}

interface DiagnosticResponse {
  diagnostic: DiagnosticData | null;
  answers: AnswerData[];
}

export const useDiagnosticState = () => {
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
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

    const initDiagnostic = async () => {
      try {
        const data = await apiClient.get<DiagnosticResponse>(
          `/organizations/${organization.id}/diagnostic`
        );

        if (data.diagnostic) {
          setDiagnosticId(data.diagnostic.id);

          const loadedAnswers: { [key: string]: string } = {};
          data.answers?.forEach((answer) => {
            const key = `${answer.blockIndex}-${answer.questionIndex}`;
            loadedAnswers[key] = answer.answer;
          });

          setAnswers(loadedAnswers);
        } else {
          // Create a new diagnostic session
          const newData = await apiClient.post<DiagnosticResponse>(
            `/organizations/${organization.id}/diagnostic`
          );

          if (newData.diagnostic) {
            setDiagnosticId(newData.diagnostic.id);
          }
        }
      } catch (error) {
        console.error("Failed to initialize diagnostic:", error);
        toast({
          title: "Erro ao carregar diagnostico",
          description: "Nao foi possivel carregar seu progresso. Tente novamente.",
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

        await apiClient.post(`/organizations/${organization.id}/diagnostic/answers`, {
          blockIndex,
          questionIndex,
          answer,
        });
      } catch (error) {
        console.error("Failed to save answer:", error);
        toast({
          title: "Erro ao salvar",
          description: "Nao foi possivel salvar sua resposta. Tente novamente.",
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
    if (!diagnosticId || !organization?.id) return;

    try {
      await apiClient.post(`/organizations/${organization.id}/diagnostic/complete`);
    } catch (error) {
      console.error("Failed to complete diagnostic:", error);
      toast({
        title: "Erro ao finalizar",
        description: "Nao foi possivel finalizar o diagnostico. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [diagnosticId, organization?.id, toast]);

  const calculateProgress = useCallback(
    (totalQuestions: number) => {
      const answeredCount = Object.values(answers).filter(
        (answer) => answer && answer.trim().length > 0
      ).length;
      return Math.round((answeredCount / totalQuestions) * 100);
    },
    [answers]
  );

  return {
    answers,
    updateAnswer,
    completeDiagnostic,
    calculateProgress,
    isLoading,
    isSaving,
  };
};
