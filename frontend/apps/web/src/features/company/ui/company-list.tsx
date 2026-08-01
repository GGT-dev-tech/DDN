'use client';

import { useState } from 'react';
import { useCompaniesList } from '../../../entities/company/api/use-companies-list';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { CompanyForm } from './company-form';

export function CompanyList() {
  const { data: companies, isLoading } = useCompaniesList();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Empresas</h2>
          <p className="text-muted-foreground">Gerencie as empresas e clientes da plataforma.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Empresa
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[500px]">
            <SheetHeader>
              <SheetTitle>Cadastrar Nova Empresa</SheetTitle>
              <SheetDescription>
                Preencha os dados da nova empresa abaixo. Clique em salvar quando terminar.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <CompanyForm onSuccess={() => setIsSheetOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="rounded-md border bg-background/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome Fantasia</TableHead>
              <TableHead>Razão Social</TableHead>
              <TableHead>CNPJ/Documento</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : companies?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhuma empresa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              companies?.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.trade_name}</TableCell>
                  <TableCell>{company.corporate_name}</TableCell>
                  <TableCell>{company.document_number}</TableCell>
                  <TableCell>{company.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
