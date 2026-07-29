"use client";

import { CreateContractForm } from "../../../../features/contract/ui/create-contract-form";
import { Button } from "@repo/ui/src/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewContractPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contracts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Contract</h1>
          <p className="text-zinc-500 mt-1">Register a new commercial contract and its base items.</p>
        </div>
      </div>
      
      <div className="mt-8">
        <CreateContractForm />
      </div>
    </div>
  );
}
