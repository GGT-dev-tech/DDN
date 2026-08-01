import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServicePlan } from "../model/types";
import { ServicePlanStatusBadge } from "./service-plan-status-badge";

interface Props {
  plans: ServicePlan[];
  onSelect?: (plan: ServicePlan) => void;
}

export function ServicePlanTable({ plans, onSelect }: Props) {
  if (plans.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500 border rounded-md">
        No service plans found for this contract.
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow 
              key={plan.id}
              className={onSelect ? "cursor-pointer hover:bg-zinc-50" : ""}
              onClick={() => onSelect?.(plan)}
            >
              <TableCell className="font-medium">{plan.id}</TableCell>
              <TableCell>
                <ServicePlanStatusBadge status={plan.status} label={plan.statusLabel} />
              </TableCell>
              <TableCell>v{plan.version}</TableCell>
              <TableCell>{plan.lastUpdated}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
