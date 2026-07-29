import { z } from "zod";

export const contractCreateSchema = z.object({
  tenant_id: z.string().min(1, "Tenant ID is required"),
  company_id: z.string().min(1, "Company ID is required"),
  quotation_id: z.string().min(1, "Quotation ID is required"),
  effective_date: z.string().min(1, "Effective Date is required"),
  items: z.array(
    z.object({
      service_offering_id: z.string().min(1, "Service Offering is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
    })
  ).min(1, "At least one item is required")
});

export type ContractCreateValues = z.infer<typeof contractCreateSchema>;
