export type ContractStatus = "DRAFT" | "PENDING_SIGNATURE" | "ACTIVE" | "COMPLETED" | "CANCELED";

export interface Contract {
  id: string;
  quotationId: string;
  customerId: string;
  status: ContractStatus;
  
  // UI Specific formatted fields
  statusLabel: string;
  createdAt: string;
  validity: string;
}
