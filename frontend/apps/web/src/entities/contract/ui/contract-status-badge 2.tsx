import { Badge } from "@repo/ui/src/components/ui/badge";
import { ContractStatus } from "../model/types";

interface Props {
  status: ContractStatus;
  label: string;
}

export function ContractStatusBadge({ status, label }: Props) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  
  switch (status) {
    case "DRAFT":
      variant = "secondary";
      break;
    case "PENDING_SIGNATURE":
      variant = "outline";
      break;
    case "ACTIVE":
      variant = "default";
      break;
    case "COMPLETED":
      variant = "outline";
      break;
    case "CANCELED":
      variant = "destructive";
      break;
  }

  return <Badge variant={variant}>{label}</Badge>;
}
