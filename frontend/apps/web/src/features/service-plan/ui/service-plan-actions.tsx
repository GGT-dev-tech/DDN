import { MoreHorizontal, Play, Pause } from "lucide-react";
import { Button } from "@repo/ui/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/src/components/ui/dropdown-menu";
import { ServicePlan } from "../../../entities/service-plan/model/types";
import { usePublishPlanMutation, useSuspendPlanMutation } from "../api/queries";
import { toast } from "sonner"; // We added sonner in sprint 2

interface Props {
  plan: ServicePlan;
}

export function ServicePlanActions({ plan }: Props) {
  const publishMutation = usePublishPlanMutation();
  const suspendMutation = useSuspendPlanMutation();

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(plan.id);
      toast.success("Service plan published successfully.");
    } catch (e) {
      toast.error("Failed to publish the plan.");
    }
  };

  const handleSuspend = async () => {
    try {
      await suspendMutation.mutateAsync(plan.id);
      toast.success("Service plan suspended.");
    } catch (e) {
      toast.error("Failed to suspend the plan.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handlePublish}
          disabled={!plan.canPublish || publishMutation.isPending}
        >
          <Play className="mr-2 h-4 w-4 text-green-600" />
          <span>Publish</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={handleSuspend}
          disabled={plan.status !== "ACTIVE" || suspendMutation.isPending}
        >
          <Pause className="mr-2 h-4 w-4 text-amber-600" />
          <span>Suspend</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
