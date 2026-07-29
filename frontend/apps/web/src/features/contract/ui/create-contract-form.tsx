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

export function CreateContractForm() {
  const router = useRouter();
  const createMutation = useCreateContractMutation();

  const form = useForm<ContractCreateValues>({
    resolver: zodResolver(contractCreateSchema),
    defaultValues: {
      tenant_id: "tenant-stitch-123", // default for this mockup
      company_id: "",
      quotation_id: "",
      effective_date: new Date().toISOString().split('T')[0],
      items: [
        { service_offering_id: "", quantity: 1 }
      ]
    },
  });

  async function onSubmit(data: ContractCreateValues) {
    try {
      await createMutation.mutateAsync(data);
      // Redirect back to contracts list upon success
      router.push("/contracts");
    } catch (error) {
      console.error("Failed to create contract", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg border shadow-sm">
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Contract Details</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. comp-456" {...field} />
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
                  <FormLabel>Quotation ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. quo-789" {...field} />
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
                <FormLabel>Effective Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>When does this contract start applying?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-lg font-semibold">Contract Items</h2>
          <p className="text-sm text-zinc-500 mb-4">Add the services included in this contract.</p>
          
          <div className="flex items-end gap-4">
            <FormField
              control={form.control}
              name="items.0.service_offering_id"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Service Offering ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. srv-waste-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="items.0.quantity"
              render={({ field }) => (
                <FormItem className="w-24">
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create Contract"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
