"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { useServicePlans } from "../../../features/service-plan/api/queries";
import { ServicePlanTable } from "../../../entities/service-plan/ui/service-plan-table";
import { ServicePlanDrawer } from "../../../entities/service-plan/ui/service-plan-drawer";
import { CreateServicePlanForm } from "../../../features/service-plan/ui/create-service-plan-form";
import { ServicePlan } from "../../../entities/service-plan/model/types";
import { Button } from "@repo/ui/src/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/src/components/ui/sheet";

function ServicePlansContent() {
  const searchParams = useSearchParams();
  const contractId = searchParams.get("contractId") || "";
  const { data: plans, isLoading, error } = useServicePlans(contractId);
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Planos de Serviço
          </h1>
          {contractId && (
            <p className="text-zinc-500 mt-1 text-sm flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Contrato: <span className="font-mono">{contractId}</span>
            </p>
          )}
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Plano
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[500px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Criar Plano de Serviço</SheetTitle>
              <SheetDescription>
                Associe um plano de serviço a um contrato existente.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <CreateServicePlanForm
                defaultContractId={contractId}
                onSuccess={() => setIsSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* ── States ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="p-12 text-center text-zinc-500 animate-pulse">
          Carregando planos de serviço...
        </div>
      )}

      {error && (
        <div className="p-4 border border-red-400 rounded-lg bg-red-50 text-red-900">
          <strong>Erro:</strong>{" "}
          {error instanceof Error ? error.message : "Erro desconhecido"}
        </div>
      )}

      {!isLoading && !contractId && !error && (
        <div className="p-12 text-center border-2 border-dashed rounded-lg">
          <FileText className="mx-auto h-10 w-10 text-zinc-300 mb-3" />
          <p className="text-zinc-500 font-medium">Nenhum contrato selecionado</p>
          <p className="text-zinc-400 text-sm mt-1">
            Acesse a página de{" "}
            <a href="/contracts" className="text-blue-600 underline">
              Contratos
            </a>{" "}
            e clique em um contrato para ver seus planos.
          </p>
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────── */}
      {plans && (
        <ServicePlanTable
          plans={plans}
          onSelect={(plan) => setSelectedPlan(plan)}
        />
      )}

      {/* ── Detail Drawer ──────────────────────────────────── */}
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
      <Suspense
        fallback={
          <div className="p-8 text-center text-zinc-500 animate-pulse">
            Carregando...
          </div>
        }
      >
        <ServicePlansContent />
      </Suspense>
    </div>
  );
}
