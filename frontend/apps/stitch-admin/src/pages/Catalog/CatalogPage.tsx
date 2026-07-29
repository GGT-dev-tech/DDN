import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/ui/components/Tabs";
import { UOMTable } from "./components/UOMTable";
import { AttributesTable } from "./components/AttributesTable";
import { OfferingsTable } from "./components/OfferingsTable";

export function CatalogPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Catálogo de Serviços</h2>
      </div>
      
      <Tabs defaultValue="offerings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="offerings">Ofertas de Serviço</TabsTrigger>
          <TabsTrigger value="attributes">Atributos</TabsTrigger>
          <TabsTrigger value="uoms">Unidades de Medida</TabsTrigger>
        </TabsList>
        
        <TabsContent value="offerings" className="space-y-4">
          <OfferingsTable />
        </TabsContent>
        
        <TabsContent value="attributes" className="space-y-4">
          <AttributesTable />
        </TabsContent>
        
        <TabsContent value="uoms" className="space-y-4">
          <UOMTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
