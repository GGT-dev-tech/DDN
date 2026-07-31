import { Metadata } from 'next';
import { CompanyList } from '@/features/company/ui/company-list';

export const metadata: Metadata = {
  title: 'Empresas | DDN OS',
  description: 'Gerenciamento de empresas',
};

export default function CompaniesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CompanyList />
    </div>
  );
}
