"use client";

import { useRouteQuery } from "../../../../features/routing/api/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function RouteDetailsPage() {
  const params = useParams();
  const routeId = params.routeId as string;
  const { data: route, isLoading } = useRouteQuery(routeId);

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500 animate-pulse">Loading route details...</div>;
  }

  if (!route) {
    return <div className="p-8 text-center text-red-500">Route not found.</div>;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Route Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b bg-white shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/routing">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
              Route {route.id}
              <Badge variant="outline" className={cn("font-normal border", route.statusColor)}>
                {route.statusLabel}
              </Badge>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <span className="flex items-center gap-1"><Navigation className="h-4 w-4" /> {route.plannedDistance} km</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {route.plannedDuration} min</span>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Stops List */}
        <div className="w-1/3 min-w-[320px] max-w-[400px] border-r bg-zinc-50 overflow-y-auto flex flex-col">
          <div className="p-4 border-b bg-zinc-100/50">
            <h2 className="font-semibold text-sm">Itinerary ({route.stopsCount} stops)</h2>
          </div>
          
          <div className="p-4 space-y-4">
            {route.stops.map((stop, index) => (
              <div key={stop.id} className="relative flex gap-4">
                {/* Timeline Line */}
                {index < route.stops.length - 1 && (
                  <div className="absolute top-8 left-[11px] bottom-[-24px] w-px bg-zinc-200" />
                )}
                
                {/* Timeline Node */}
                <div className="shrink-0 mt-1">
                  {stop.status === 'COLLECTED' ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 bg-white rounded-full" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-zinc-300 bg-white flex items-center justify-center">
                      <span className="text-[10px] font-bold text-zinc-500">{stop.order}</span>
                    </div>
                  )}
                </div>
                
                {/* Stop Card */}
                <div className={cn(
                  "flex-1 p-3 rounded-lg border text-sm transition-colors",
                  stop.status === 'COLLECTED' ? "bg-white opacity-60" : "bg-white shadow-sm"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Stop {stop.id}</span>
                    <Badge variant="secondary" className={cn("text-[10px]", stop.statusColor)}>
                      {stop.statusLabel}
                    </Badge>
                  </div>
                  <p className="text-zinc-600 flex items-start gap-1 mt-2">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-zinc-400" />
                    {stop.address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Map Placeholder */}
        <div className="flex-1 bg-zinc-200/50 relative">
          <div className="absolute inset-0 flex items-center justify-center flex-col text-zinc-400 p-8 text-center">
            <MapPin className="h-16 w-16 mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-zinc-500">Map View Placeholder</h3>
            <p className="max-w-sm mt-2 text-sm">
              The visual map will be rendered here based on the selected mapping engine (Google Maps or Mapbox). 
              Currently showing structural layout.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
