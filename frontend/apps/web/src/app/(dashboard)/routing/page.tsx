"use client";

import { useRoutesQuery } from "../../../features/routing/api/queries";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@repo/ui/src/components/ui/table";
import { Badge } from "@repo/ui/src/components/ui/badge";
import { Button } from "@repo/ui/src/components/ui/button";
import { ArrowRight, Map as MapIcon, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@repo/ui/src/lib/utils";

export default function RoutingPage() {
  const { data: routes, isLoading } = useRoutesQuery();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Routing Engine</h1>
          <p className="text-zinc-500 mt-1">Manage execution routes and collection requirements.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Route
        </Button>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Execution Date</TableHead>
              <TableHead>Stops</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                  Loading routes...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && routes?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                  No routes found.
                </TableCell>
              </TableRow>
            )}
            {routes?.map((route) => (
              <TableRow key={route.id}>
                <TableCell className="font-medium">
                  {route.id}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("font-normal border", route.statusColor)}>
                    {route.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell>{route.executionDate}</TableCell>
                <TableCell>{route.stopsCount} stops</TableCell>
                <TableCell>{route.plannedDistance} km</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/routing/${route.id}`}>
                      <MapIcon className="mr-2 h-4 w-4" />
                      View Map
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
