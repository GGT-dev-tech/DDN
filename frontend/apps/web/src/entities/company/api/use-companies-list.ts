import { useListCompaniesApiV1CommercialCompaniesGet } from '@repo/api';

export function useCompaniesList() {
  return useListCompaniesApiV1CommercialCompaniesGet();
}
