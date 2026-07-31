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
import { useCreateCompany } from '../../../entities/company/api/use-create-company';
import { toast } from 'sonner';

const formSchema = z.object({
  trade_name: z.string().min(2, {
    message: 'Nome fantasia deve ter pelo menos 2 caracteres.',
  }),
  corporate_name: z.string().min(2, {
    message: 'Razão social deve ter pelo menos 2 caracteres.',
  }),
  document_number: z.string().min(14, {
    message: 'CNPJ inválido.',
  }),
});

interface CompanyFormProps {
  onSuccess?: () => void;
}

export function CompanyForm({ onSuccess }: CompanyFormProps) {
  const { mutateAsync: createCompany, isPending } = useCreateCompany();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trade_name: '',
      corporate_name: '',
      document_number: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createCompany(values);
      toast.success('Empresa criada com sucesso!');
      onSuccess?.();
    } catch (error) {
      toast.error('Ocorreu um erro ao criar a empresa.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="trade_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Fantasia</FormLabel>
              <FormControl>
                <Input placeholder="Ex: DDN Waste" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="corporate_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Razão Social</FormLabel>
              <FormControl>
                <Input placeholder="Ex: DDN Waste Management LTDA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="document_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input placeholder="00.000.000/0001-00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar Empresa'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
