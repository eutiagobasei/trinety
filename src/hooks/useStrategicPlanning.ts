import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useOrganization } from "./useOrganization";
import { toast } from "sonner";

export function useStrategicPlanning() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = organization?.id;

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      if (!orgId) throw new Error("Organização não selecionada");
      return apiClient.post(`/organizations/${orgId}/strategic-planning/generate`);
    },
    onSuccess: () => {
      toast.success("Plano estratégico gerado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["strategic-planning", orgId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao gerar plano estratégico");
    },
  });

  return {
    generatePlan: generatePlanMutation.mutate,
    isGenerating: generatePlanMutation.isPending,
  };
}

export function useCanvas() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = organization?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["canvas", orgId],
    queryFn: () => apiClient.get(`/organizations/${orgId}/strategic-planning/canvas`),
    enabled: !!orgId,
  });

  const updateMutation = useMutation({
    mutationFn: (canvasData: Record<string, string>) =>
      apiClient.put(`/organizations/${orgId}/strategic-planning/canvas`, canvasData),
    onSuccess: () => {
      toast.success("Canvas atualizado");
      queryClient.invalidateQueries({ queryKey: ["canvas", orgId] });
    },
  });

  return {
    canvas: data,
    isLoading,
    updateCanvas: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

export function useEmpathyMap() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = organization?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["empathy-map", orgId],
    queryFn: () => apiClient.get(`/organizations/${orgId}/strategic-planning/empathy-map`),
    enabled: !!orgId,
  });

  const updateMutation = useMutation({
    mutationFn: (empathyData: Record<string, string>) =>
      apiClient.put(`/organizations/${orgId}/strategic-planning/empathy-map`, empathyData),
    onSuccess: () => {
      toast.success("Mapa de empatia atualizado");
      queryClient.invalidateQueries({ queryKey: ["empathy-map", orgId] });
    },
  });

  return {
    empathyMap: data,
    isLoading,
    updateEmpathyMap: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

export function useSwot() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = organization?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["swot", orgId],
    queryFn: () => apiClient.get(`/organizations/${orgId}/strategic-planning/swot`),
    enabled: !!orgId,
  });

  const updateMutation = useMutation({
    mutationFn: (swotData: Record<string, string>) =>
      apiClient.put(`/organizations/${orgId}/strategic-planning/swot`, swotData),
    onSuccess: () => {
      toast.success("SWOT atualizado");
      queryClient.invalidateQueries({ queryKey: ["swot", orgId] });
    },
  });

  return {
    swot: data,
    isLoading,
    updateSwot: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

export function useFilosofia() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = organization?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["filosofia", orgId],
    queryFn: () => apiClient.get(`/organizations/${orgId}/strategic-planning/filosofia`),
    enabled: !!orgId,
  });

  const updateMutation = useMutation({
    mutationFn: (filosofiaData: Record<string, string>) =>
      apiClient.put(`/organizations/${orgId}/strategic-planning/filosofia`, filosofiaData),
    onSuccess: () => {
      toast.success("Filosofia atualizada");
      queryClient.invalidateQueries({ queryKey: ["filosofia", orgId] });
    },
  });

  return {
    filosofia: data,
    isLoading,
    updateFilosofia: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

export function useOkrs() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = organization?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["okrs", orgId],
    queryFn: () => apiClient.get<Array<{ id: string; objetivo: string; krs: string }>>(`/organizations/${orgId}/strategic-planning/okrs`),
    enabled: !!orgId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ okrId, data }: { okrId: string; data: Record<string, string> }) =>
      apiClient.put(`/organizations/${orgId}/strategic-planning/okrs/${okrId}`, data),
    onSuccess: () => {
      toast.success("OKR atualizado");
      queryClient.invalidateQueries({ queryKey: ["okrs", orgId] });
    },
  });

  return {
    okrs: data || [],
    isLoading,
    updateOkr: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

export function useIndicators() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = organization?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["indicators", orgId],
    queryFn: () => apiClient.get<Array<Record<string, any>>>(`/organizations/${orgId}/strategic-planning/indicators`),
    enabled: !!orgId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ indicatorId, data }: { indicatorId: string; data: Record<string, any> }) =>
      apiClient.put(`/organizations/${orgId}/strategic-planning/indicators/${indicatorId}`, data),
    onSuccess: () => {
      toast.success("Indicador atualizado");
      queryClient.invalidateQueries({ queryKey: ["indicators", orgId] });
    },
  });

  return {
    indicators: data || [],
    isLoading,
    updateIndicator: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

export function useActionPlan() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = organization?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["action-plan", orgId],
    queryFn: () => apiClient.get<Array<Record<string, any>>>(`/organizations/${orgId}/strategic-planning/action-plan`),
    enabled: !!orgId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ actionId, data }: { actionId: string; data: Record<string, any> }) =>
      apiClient.put(`/organizations/${orgId}/strategic-planning/action-plan/${actionId}`, data),
    onSuccess: () => {
      toast.success("Ação atualizada");
      queryClient.invalidateQueries({ queryKey: ["action-plan", orgId] });
    },
  });

  return {
    actions: data || [],
    isLoading,
    updateAction: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

export function useRoutines() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = organization?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["routines", orgId],
    queryFn: () => apiClient.get(`/organizations/${orgId}/strategic-planning/routines`),
    enabled: !!orgId,
  });

  const updateMutation = useMutation({
    mutationFn: (routinesData: Record<string, string>) =>
      apiClient.put(`/organizations/${orgId}/strategic-planning/routines`, routinesData),
    onSuccess: () => {
      toast.success("Rotinas atualizadas");
      queryClient.invalidateQueries({ queryKey: ["routines", orgId] });
    },
  });

  return {
    routines: data,
    isLoading,
    updateRoutines: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
