import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useOrganization } from "./useOrganization";
import { toast } from "sonner";

interface DiagnosticData {
  diagnostic: {
    id: string;
    sessionId: string;
    completed: boolean;
  } | null;
  answers: Array<{
    id: string;
    blockIndex: number;
    questionIndex: number;
    answer: string;
  }>;
}

export function useDiagnostic() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = organization?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["diagnostic", orgId],
    queryFn: () => apiClient.get<DiagnosticData>(`/organizations/${orgId}/diagnostic`),
    enabled: !!orgId,
  });

  const saveAnswerMutation = useMutation({
    mutationFn: ({ blockIndex, questionIndex, answer }: { blockIndex: number; questionIndex: number; answer: string }) =>
      apiClient.post(`/organizations/${orgId}/diagnostic/answers`, {
        blockIndex,
        questionIndex,
        answer,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagnostic", orgId] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => apiClient.post(`/organizations/${orgId}/diagnostic/complete`),
    onSuccess: () => {
      toast.success("Diagnóstico concluído!");
      queryClient.invalidateQueries({ queryKey: ["diagnostic", orgId] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => apiClient.post(`/organizations/${orgId}/diagnostic/reset`),
    onSuccess: () => {
      toast.success("Diagnóstico reiniciado");
      queryClient.invalidateQueries({ queryKey: ["diagnostic", orgId] });
    },
  });

  const getAnswer = (blockIndex: number, questionIndex: number): string => {
    const answer = data?.answers?.find(
      (a) => a.blockIndex === blockIndex && a.questionIndex === questionIndex
    );
    return answer?.answer || "";
  };

  return {
    diagnostic: data?.diagnostic,
    answers: data?.answers || [],
    isLoading,
    saveAnswer: saveAnswerMutation.mutate,
    isSaving: saveAnswerMutation.isPending,
    completeDiagnostic: completeMutation.mutate,
    isCompleting: completeMutation.isPending,
    resetDiagnostic: resetMutation.mutate,
    isResetting: resetMutation.isPending,
    getAnswer,
  };
}
