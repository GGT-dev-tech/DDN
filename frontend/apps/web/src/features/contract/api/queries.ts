import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Contract, ContractStatus } from "../../../entities/contract/model/types";

// Fallback interface matching what our API would look like
interface ContractDTO {
  id: string;
  quotation_id: string;
  customer_id: string;
  status: ContractStatus;
  created_at: string;
  valid_until: string;
}

// Mapper inside the query file since we don't have Orval DTOs for this endpoint yet
function mapContractDTOToUI(dto: ContractDTO): Contract {
  return {
    id: dto.id,
    quotationId: dto.quotation_id,
    customerId: dto.customer_id,
    status: dto.status,
    statusLabel: dto.status.replace("_", " "),
    createdAt: new Date(dto.created_at).toLocaleDateString(),
    validity: new Date(dto.valid_until).toLocaleDateString(),
  };
}

export function useContractsQuery() {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const response = await fetch("https://backend-production-946f.up.railway.app/api/v1/contracts", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch contracts");
      }
      
      const data: ContractDTO[] = await response.json();
      return data.map(mapContractDTOToUI);
    }
  });
}

export function useCreateContractMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: import("@repo/api").ContractCreateRequest) => {
      // customClient returns JSON directly (not Axios), so no .data wrapping needed
      const { createContractApiV1ContractsPost } = await import("@repo/api");
      const response = await createContractApiV1ContractsPost(data);
      return response; // customClient already unwraps JSON
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}
