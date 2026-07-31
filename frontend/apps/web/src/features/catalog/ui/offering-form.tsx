'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@repo/ui/src/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@repo/ui/src/components/ui/form';
import { Input } from '@repo/ui/src/components/ui/input';
import { useCreateOffering } from '../../../entities/catalog/api/use-create-offering';
import { useUomList } from '../../../entities/catalog/api/use-uom-list';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nome deve ter pelo menos 2 caracteres.',
  }),
  description: z.string().min(5, {
    message: 'Descrição deve ter pelo menos 5 caracteres.',
  }),
  category: z.string().min(2, {
    message: 'Categoria é obrigatória.',
  }),
  default_uom_id: z.string().uuid({
    message: 'Selecione ou insira um ID de UOM válido.',
  }),
  effective_date: z.string().min(1, {
    message: 'Data de vigência é obrigatória.',
  }),
});

interface OfferingFormProps {
  onSuccess?: () => void;
}

export function OfferingForm({ onSuccess }: OfferingFormProps) {
  const { mutateAsync: createOffering, isPending } = useCreateOffering();
  const { data: uoms } = useUomList();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      default_uom_id: '',
      effective_date: new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createOffering({ data: values });
      toast.success('Serviço criado com sucesso!');
      onSuccess?.();
    } catch (error) {
      // Error handled by the hook
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Serviço</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Coleta de Resíduo Orgânico" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Coleta programada de resíduos úmidos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Resíduos Sólidos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="default_uom_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade de Medida (UOM ID)</FormLabel>
              <FormControl>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  {...field}
                >
                  <option value="">Selecione uma UOM</option>
                  {uoms?.map((uom: any) => (
                    <option key={uom.id} value={uom.id}>
                      {uom.name} ({uom.symbol})
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>
                Caso não encontre a UOM, crie-a primeiro no painel abaixo.
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
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar Serviço'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
