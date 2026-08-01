'use client';

import { useState } from 'react';
import { useOfferingsList } from '../../../entities/catalog/api/use-offerings-list';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { OfferingForm } from './offering-form';
import { Badge } from '@/components/ui/badge';

export function OfferingList() {
  const { data: offerings, isLoading } = useOfferingsList();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Serviços / Offerings</h2>
          <p className="text-muted-foreground text-sm">Gerencie os serviços oferecidos no catálogo.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Novo Serviço
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[400px]">
            <SheetHeader>
              <SheetTitle>Cadastrar Serviço</SheetTitle>
              <SheetDescription>
                Adicione um novo serviço ao catálogo.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <OfferingForm onSuccess={() => setIsSheetOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="rounded-md border bg-background/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código Interno</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : offerings?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Nenhum serviço encontrado.
                </TableCell>
              </TableRow>
            ) : (
              offerings?.map((offering: any) => (
                <TableRow key={offering.id}>
                  <TableCell className="font-medium text-muted-foreground">{offering.internal_code}</TableCell>
                  <TableCell>{offering.name}</TableCell>
                  <TableCell>
                    <Badge variant={offering.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {offering.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
