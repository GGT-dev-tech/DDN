export type ServicePlanStatus = "DRAFT" | "ACTIVE" | "CANCELED" | "SUSPENDED";

export interface ServicePlan {
  id: string;
  contractId: string;
  status: ServicePlanStatus;
  version: number;
  
  // UI Specific formatted fields
  statusLabel: string;
  lastUpdated: string; // Formatted date
  isPublished: boolean;
  canPublish: boolean;
}
