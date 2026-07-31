import { Metadata } from 'next';
import { OfferingList } from '@/features/catalog/ui/offering-list';
import { UomList } from '@/features/catalog/ui/uom-list';

export const metadata: Metadata = {
  title: 'Catálogo | DDN OS',
  description: 'Gerenciamento de serviços e unidades de medida',
};

export default function CatalogPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Catálogo Base</h2>
        <p className="text-muted-foreground">
          Gerencie os serviços, produtos e unidades de medida utilizados no sistema.
        </p>
      </div>

      <hr className="my-4 border-muted" />

      <OfferingList />

      <hr className="my-8 border-muted" />

      <UomList />
    </div>
  );
}
