"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useContractsQuery } from "../../../features/contract/api/queries";
import { ContractTable } from "../../../entities/contract/ui/contract-table";
import { CreateContractForm } from "../../../features/contract/ui/create-contract-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";

export default function ContractsPage() {
  const router = useRouter();
  const { data: contracts, isLoading, error } = useContractsQuery();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
          <p className="text-zinc-500 mt-1">Gerencie os contratos de serviço dos clientes.</p>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Criar Novo Contrato</SheetTitle>
              <SheetDescription>
                Preencha os dados do contrato. Você precisará de um ID de empresa e uma cotação aprovada.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <CreateContractForm onSuccess={() => setIsSheetOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {isLoading && (
        <div className="p-8 text-center text-zinc-500 animate-pulse">
          Carregando contratos...
        </div>
      )}

      {error && (
        <div className="p-4 border border-red-500 rounded bg-red-50 text-red-900">
          Erro ao carregar contratos: {error instanceof Error ? error.message : "Erro desconhecido"}
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
