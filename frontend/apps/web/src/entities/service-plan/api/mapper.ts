import { ServicePlan, ServicePlanStatus } from "../model/types";

// Since backend doesn't have a typed response yet, we use any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapServicePlanDTOToUI(dto: any): ServicePlan {
  const status = (dto.status || "DRAFT") as ServicePlanStatus;
  
  const statusLabels: Record<ServicePlanStatus, string> = {
    DRAFT: "Draft",
    ACTIVE: "Active",
    CANCELED: "Canceled",
    SUSPENDED: "Suspended",
  };

  return {
    id: dto.id || "",
    contractId: dto.contract_id || "",
    status,
    version: dto.version || 1,
    statusLabel: statusLabels[status] || status,
    lastUpdated: new Date().toLocaleDateString(), // Placeholder until backend returns updated_at
    isPublished: status !== "DRAFT",
    canPublish: status === "DRAFT",
  };
}
