"use client";

import { useServicePlans } from "../../../features/service-plan/api/queries";
import { ServicePlanTable } from "../../../entities/service-plan/ui/service-plan-table";
import { ServicePlanDrawer } from "../../../entities/service-plan/ui/service-plan-drawer";
import { ServicePlan } from "../../../entities/service-plan/model/types";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ServicePlansContent() {
  const searchParams = useSearchParams();
  const contractId = searchParams.get("contractId") || "";
  const { data: plans, isLoading, error } = useServicePlans(contractId);
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Service Plans {contractId && <span className="text-zinc-500 text-lg font-normal ml-2">for Contract: {contractId}</span>}
        </h1>
      </div>
      
      {/* Removed manual input since it comes from the URL now */}

      {isLoading && (
        <div className="p-8 text-center text-zinc-500 animate-pulse">
          Loading service plans...
        </div>
      )}

      {error && (
        <div className="p-4 border border-red-500 rounded bg-red-50 text-red-900">
          Error loading plans: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}

      {plans && (
        <ServicePlanTable 
          plans={plans} 
          onSelect={(plan) => setSelectedPlan(plan)}
        />
      )}

      <ServicePlanDrawer 
        plan={selectedPlan} 
        isOpen={!!selectedPlan} 
        onOpenChange={(open) => !open && setSelectedPlan(null)} 
      />
    </>
  );
}

export default function ServicePlansPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <Suspense fallback={<div className="p-8 text-center text-zinc-500 animate-pulse">Loading...</div>}>
        <ServicePlansContent />
      </Suspense>
    </div>
  );
}
