import { useRegisterUomApiV1CatalogUomPost } from '@repo/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useCreateUom() {
  const queryClient = useQueryClient();

  return useRegisterUomApiV1CatalogUomPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/catalog/uom'] });
      },
      onError: () => {
        toast.error('Erro ao criar unidade de medida.');
      },
    },
  });
}
