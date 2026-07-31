import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listPlansByContractApiV1ServicePlansContractContractIdGet,
  publishPlanApiV1ServicePlansPlanIdPublishPost,
  suspendPlanApiV1ServicePlansPlanIdSuspendPost,
} from "@repo/api";
import { mapServicePlanDTOToUI } from "../../../entities/service-plan/api/mapper";
import { ServicePlan } from "../../../entities/service-plan/model/types";

export function useServicePlans(contractId: string) {
  return useQuery({
    queryKey: ["service-plans", contractId],
    queryFn: async (): Promise<ServicePlan[]> => {
      // customClient returns JSON directly (not Axios)
      const data = await listPlansByContractApiV1ServicePlansContractContractIdGet(
        contractId,
        { tenant_id: "tenant-1" } // Temporarily hardcoded until auth context is ready
      );

      if (Array.isArray(data)) {
        return data.map(mapServicePlanDTOToUI);
      }

      return [];
    },
    enabled: !!contractId,
  });
}

export function usePublishPlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      // customClient returns JSON directly
      return publishPlanApiV1ServicePlansPlanIdPublishPost(planId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-plans"] });
    },
  });
}

export function useSuspendPlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      // customClient returns JSON directly
      return suspendPlanApiV1ServicePlansPlanIdSuspendPost(planId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-plans"] });
    },
  });
}

