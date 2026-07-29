import { useQuery } from "@tanstack/react-query";
import { listPlansByContractApiV1ServicePlansContractContractIdGet } from "@repo/api";
import { mapServicePlanDTOToUI } from "../../../entities/service-plan/api/mapper";
import { ServicePlan } from "../../../entities/service-plan/model/types";

export function useServicePlans(contractId: string) {
  return useQuery({
    queryKey: ["service-plans", contractId],
    queryFn: async (): Promise<ServicePlan[]> => {
      const response = await listPlansByContractApiV1ServicePlansContractContractIdGet(
        contractId,
        { tenant_id: "tenant-1" } // Temporarily hardcoded until auth context is ready
      );
      
      // response contains data, status, and headers
      const data = response.data; 
      
      if (Array.isArray(data)) {
        return data.map(mapServicePlanDTOToUI);
      }
      
      return [];
    },
    enabled: !!contractId,
  });
}
