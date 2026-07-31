import { useDraftOfferingApiV1CatalogOfferingsPost } from '@repo/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useCreateOffering() {
  const queryClient = useQueryClient();

  return useDraftOfferingApiV1CatalogOfferingsPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/catalog/offerings'] });
      },
      onError: () => {
        toast.error('Erro ao criar serviço.');
      },
    },
  });
}
