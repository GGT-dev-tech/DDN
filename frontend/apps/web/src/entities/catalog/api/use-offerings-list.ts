import { useListOfferingsApiV1CatalogOfferingsGet } from '@repo/api';

export function useOfferingsList() {
  return useListOfferingsApiV1CatalogOfferingsGet();
}
