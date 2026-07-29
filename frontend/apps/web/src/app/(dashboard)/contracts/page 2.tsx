"use client";

import { useRouter } from "next/navigation";
import { useContractsQuery } from "../../../features/contract/api/queries";
import { ContractTable } from "../../../entities/contract/ui/contract-table";

export default function ContractsPage() {
  const router = useRouter();
  const { data: contracts, isLoading, error } = useContractsQuery();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
      </div>

      {isLoading && (
        <div className="p-8 text-center text-zinc-500 animate-pulse">
          Loading contracts...
        </div>
      )}

      {error && (
        <div className="p-4 border border-red-500 rounded bg-red-50 text-red-900">
          Error loading contracts: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}

      {contracts && (
        <ContractTable 
          contracts={contracts} 
          onSelect={(contract) => router.push(`/service-plans?contractId=${contract.id}`)}
        />
      )}
    </div>
  );
}
