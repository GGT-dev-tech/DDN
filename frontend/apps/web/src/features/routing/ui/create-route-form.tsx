"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/src/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/src/components/ui/form";
import { Input } from "@repo/ui/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/src/components/ui/card";
import { MapPin, Plus, Trash2, Truck } from "lucide-react";
import { useCreateRouteMutation } from "../api/mutations";
import { RouteCreateFormValues, routeCreateSchema } from "../model/schemas";
import { useState } from "react";

export function CreateRouteForm() {
  const router = useRouter();
  const createRouteMutation = useCreateRouteMutation();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<RouteCreateFormValues>({
    resolver: zodResolver(routeCreateSchema),
    defaultValues: {
      execution_date: new Date().toISOString().split("T")[0],
      estimated_volume: 0,
      estimated_weight: 0,
      planned_distance: 0,
      planned_duration: 0,
      vehicle_id: "veh-001", // Default mock for demo
      driver_id: "drv-001", // Default mock for demo
      stops: [
        { latitude: -23.55052, longitude: -46.633308, address: "", order: 1 }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stops",
  });

  async function onSubmit(data: RouteCreateFormValues) {
    setGlobalError(null);
    try {
      await createRouteMutation.mutateAsync(data);
      router.push("/routing");
      router.refresh();
    } catch (err: any) {
      setGlobalError(err.message || "Failed to create route");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {globalError && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {globalError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base Information */}
          <Card>
            <CardHeader>
              <CardTitle>Base Information</CardTitle>
              <CardDescription>General details and resource allocation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="execution_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Execution Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicle_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle ID</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Truck className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-8" placeholder="veh-xxx" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="driver_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver ID</FormLabel>
                      <FormControl>
                        <Input placeholder="drv-xxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimated_weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Est. Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estimated_volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Est. Volume (m³)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stops Configuration */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Route Stops</CardTitle>
                <CardDescription>Configure the geolocated stops</CardDescription>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => append({ latitude: 0, longitude: 0, address: "", order: fields.length + 1 })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stop
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg bg-muted/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Stop #{index + 1}</span>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`stops.${index}.address`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-8" placeholder="123 Street Name, City" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`stops.${index}.latitude`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.000001" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`stops.${index}.longitude`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.000001" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={createRouteMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={createRouteMutation.isPending}>
            {createRouteMutation.isPending ? "Creating..." : "Create Route"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
