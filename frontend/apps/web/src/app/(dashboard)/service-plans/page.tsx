"use client";

import { useServicePlans } from "../../../features/service-plan/api/queries";
import { ServicePlanTable } from "../../../entities/service-plan/ui/service-plan-table";
import { useState } from "react";

export default function ServicePlansPage() {
  const [contractId, setContractId] = useState("mock-contract-id-123");
  const { data: plans, isLoading, error } = useServicePlans(contractId);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Service Plans</h1>
      </div>
      
      <div className="flex gap-4 items-center">
        <label className="text-sm font-medium">Contract ID:</label>
        <input 
          type="text" 
          value={contractId} 
          onChange={e => setContractId(e.target.value)}
          className="border rounded p-2 text-sm w-64"
        />
      </div>

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

      {plans && <ServicePlanTable plans={plans} />}
    </div>
  );
}
