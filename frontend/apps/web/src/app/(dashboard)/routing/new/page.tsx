import { CreateRouteForm } from "@/features/routing/ui/create-route-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewRoutePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/routing">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Route</h1>
          <p className="text-muted-foreground">
            Configure base details, assign resources, and setup stops.
          </p>
        </div>
      </div>
      
      <div className="max-w-5xl">
        <CreateRouteForm />
      </div>
    </div>
  );
}
