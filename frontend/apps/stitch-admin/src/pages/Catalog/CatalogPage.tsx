import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/ui/components/Tabs";
import { UOMTable } from "./components/UOMTable";
import { AttributesTable } from "./components/AttributesTable";
import { OfferingsTable } from "./components/OfferingsTable";
import { PriceTablesTable } from "./components/PriceTablesTable";
import { LayoutList } from "lucide-react";

export function CatalogPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
              <LayoutList size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Catálogo de Serviços</h1>
              <p className="text-sm text-text-secondary mt-1">
                Configure as ofertas, atributos e unidades de medida para precificação.
              </p>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="offerings" className="space-y-6">
          <TabsList className="bg-black/5 dark:bg-white/5 border border-border/50 p-1 rounded-xl">
            <TabsTrigger value="offerings" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">Ofertas de Serviço</TabsTrigger>
            <TabsTrigger value="attributes" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">Atributos</TabsTrigger>
            <TabsTrigger value="uoms" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">Unidades de Medida</TabsTrigger>
            <TabsTrigger value="price_tables" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">Tabelas de Preços</TabsTrigger>
          </TabsList>
          
          <TabsContent value="offerings" className="focus-visible:outline-none focus-visible:ring-0">
            <OfferingsTable />
          </TabsContent>
          
          <TabsContent value="attributes" className="focus-visible:outline-none focus-visible:ring-0">
            <AttributesTable />
          </TabsContent>
          
          <TabsContent value="uoms" className="focus-visible:outline-none focus-visible:ring-0">
            <UOMTable />
          </TabsContent>

          <TabsContent value="price_tables" className="focus-visible:outline-none focus-visible:ring-0">
            <PriceTablesTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
