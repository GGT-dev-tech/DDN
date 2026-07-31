"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContractCreateValues, contractCreateSchema } from "../model/schemas";
import { useCreateContractMutation } from "../api/queries";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/src/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/src/components/ui/form";
import { Input } from "@repo/ui/src/components/ui/input";
import { toast } from "sonner";

interface CreateContractFormProps {
  /** Called after successful creation. If provided, navigation is skipped. */
  onSuccess?: () => void;
}

export function CreateContractForm({ onSuccess }: CreateContractFormProps = {}) {
  const router = useRouter();
  const createMutation = useCreateContractMutation();

  const form = useForm<ContractCreateValues>({
    resolver: zodResolver(contractCreateSchema),
    defaultValues: {
      tenant_id: "tenant-stitch-123",
      company_id: "",
      quotation_id: "",
      effective_date: new Date().toISOString().split("T")[0],
      items: [{ service_offering_id: "", quantity: 1 }],
    },
  });

  async function onSubmit(data: ContractCreateValues) {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Contrato criado com sucesso!");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/contracts");
      }
    } catch (error) {
      toast.error("Falha ao criar contrato. Verifique os dados e tente novamente.");
      console.error("Failed to create contract", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-base font-semibold">Dados do Contrato</h2>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID da Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: comp-456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quotation_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID da Cotação</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: quo-789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="effective_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Vigência</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>A partir de quando este contrato passa a valer.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-base font-semibold">Itens do Contrato</h2>
          <p className="text-sm text-zinc-500">Serviços incluídos neste contrato.</p>

          <div className="flex items-end gap-4">
            <FormField
              control={form.control}
              name="items.0.service_offering_id"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>ID do Serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: srv-waste-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="items.0.quantity"
              render={({ field }) => (
                <FormItem className="w-28">
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => (onSuccess ? onSuccess() : router.back())}
            disabled={createMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Criando..." : "Criar Contrato"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
