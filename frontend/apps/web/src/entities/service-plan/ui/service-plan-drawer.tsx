import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/src/components/ui/sheet";
import { ServicePlan } from "../model/types";
import { ServicePlanStatusBadge } from "./service-plan-status-badge";
import { ServicePlanActions } from "../../../features/service-plan/ui/service-plan-actions";

interface Props {
  plan: ServicePlan | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServicePlanDrawer({ plan, isOpen, onOpenChange }: Props) {
  if (!plan) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="text-xl">Service Plan</SheetTitle>
              <SheetDescription>
                ID: {plan.id}
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <ServicePlanStatusBadge status={plan.status} label={plan.statusLabel} />
              <ServicePlanActions plan={plan} />
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900 border-b pb-1">Overview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500 font-medium">Contract ID</p>
                <p className="mt-1 font-mono text-zinc-900">{plan.contractId}</p>
              </div>
              <div>
                <p className="text-zinc-500 font-medium">Current Version</p>
                <p className="mt-1 text-zinc-900">v{plan.version}</p>
              </div>
              <div>
                <p className="text-zinc-500 font-medium">Last Updated</p>
                <p className="mt-1 text-zinc-900">{plan.lastUpdated}</p>
              </div>
            </div>
          </section>
          
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900 border-b pb-1">Schedules & Routes</h3>
            <div className="p-4 bg-zinc-50 rounded-md border border-zinc-100 text-center text-zinc-500 text-sm">
              {plan.status === "DRAFT" 
                ? "Schedules are being configured." 
                : "Operational routes are currently locked for execution."}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
