'use client';

import { useState } from 'react';
import { useUomList } from '../../../entities/catalog/api/use-uom-list';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { UomForm } from './uom-form';

export function UomList() {
  const { data: uoms, isLoading } = useUomList();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Unidades de Medida</h2>
          <p className="text-muted-foreground text-sm">Gerencie as UOMs (Tonelada, Litro, etc).</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Nova UOM
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[400px]">
            <SheetHeader>
              <SheetTitle>Cadastrar UOM</SheetTitle>
              <SheetDescription>
                Adicione uma nova Unidade de Medida ao catálogo.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <UomForm onSuccess={() => setIsSheetOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="rounded-md border bg-background/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Símbolo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : uoms?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  Nenhuma UOM encontrada.
                </TableCell>
              </TableRow>
            ) : (
              uoms?.map((uom: any) => (
                <TableRow key={uom.id}>
                  <TableCell className="font-medium">{uom.name}</TableCell>
                  <TableCell>{uom.symbol}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
