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
} from '@repo/ui/src/components/ui/form';
import { Input } from '@repo/ui/src/components/ui/input';
import { useCreateUom } from '../../../entities/catalog/api/use-create-uom';
import { toast } from 'sonner';
import { UOMBaseType } from '@repo/api';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nome deve ter pelo menos 2 caracteres.',
  }),
  symbol: z.string().min(1, {
    message: 'Símbolo é obrigatório.',
  }),
  base_type: z.nativeEnum(UOMBaseType, {
    message: 'Tipo base inválido.',
  }),
});

interface UomFormProps {
  onSuccess?: () => void;
}

export function UomForm({ onSuccess }: UomFormProps) {
  const { mutateAsync: createUom, isPending } = useCreateUom();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      symbol: '',
      base_type: UOMBaseType.UNIT,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createUom({ data: values });
      toast.success('Unidade de Medida criada com sucesso!');
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
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Tonelada" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Símbolo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: t" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="base_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo Base</FormLabel>
              <FormControl>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  {...field}
                >
                  {Object.values(UOMBaseType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar Unidade'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
