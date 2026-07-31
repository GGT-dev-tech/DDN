import { useMutation, useQueryClient } from '@tanstack/react-query';

// Mock hook since the API doesn't have a POST endpoint yet
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { trade_name: string; corporate_name: string; document_number: string }) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        id: crypto.randomUUID(),
        ...data,
        status: 'ACTIVE',
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/commercial/companies'] });
    },
  });
}
