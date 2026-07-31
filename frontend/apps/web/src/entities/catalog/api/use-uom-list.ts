import { useListUomsApiV1CatalogUomGet } from '@repo/api';

export function useUomList() {
  return useListUomsApiV1CatalogUomGet();
}
