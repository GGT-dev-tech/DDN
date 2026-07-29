import { Badge } from "@repo/ui/src/components/ui/badge";
import { ServicePlanStatus } from "../model/types";

interface Props {
  status: ServicePlanStatus;
  label: string;
}

export function ServicePlanStatusBadge({ status, label }: Props) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  
  switch (status) {
    case "DRAFT":
      variant = "secondary";
      break;
    case "ACTIVE":
      variant = "default";
      break;
    case "CANCELED":
      variant = "destructive";
      break;
    case "SUSPENDED":
      variant = "outline";
      break;
  }

  return <Badge variant={variant}>{label}</Badge>;
}
