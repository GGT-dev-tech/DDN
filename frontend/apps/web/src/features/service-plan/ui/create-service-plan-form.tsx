"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const servicePlanSchema = z.object({
  contract_id: z.string().min(1, "ID do contrato é obrigatório."),
  effective_date: z.string().min(1, "Data de vigência é obrigatória."),
});

type ServicePlanFormValues = z.infer<typeof servicePlanSchema>;

interface CreateServicePlanFormProps {
  /** Pre-fills the contract_id field when navigating from the Contracts page */
  defaultContractId?: string;
  onSuccess?: () => void;
}

export function CreateServicePlanForm({
  defaultContractId = "",
  onSuccess,
}: CreateServicePlanFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<ServicePlanFormValues>({
    resolver: zodResolver(servicePlanSchema),
    defaultValues: {
      contract_id: defaultContractId,
      effective_date: new Date().toISOString().split("T")[0],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ServicePlanFormValues) => {
      const response = await fetch("https://backend-production-946f.up.railway.app/api/v1/service-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Erro ao criar plano: ${response.status} ${body}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-plans"] });
      toast.success("Plano de Serviço criado com sucesso!");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Falha ao criar o plano de serviço.");
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="contract_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID do Contrato</FormLabel>
              <FormControl>
                <Input
                  placeholder="ex: cont-xxxxxxxx-xxxx-xxxx"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                O contrato ao qual este plano de serviço pertence.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="effective_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Vigência</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>
                Data de início de execução do plano.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Criando..." : "Criar Plano"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
