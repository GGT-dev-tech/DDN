import { z } from "zod";

export const stopSchema = z.object({
  latitude: z.number().min(-90).max(90, "Invalid latitude"),
  longitude: z.number().min(-180).max(180, "Invalid longitude"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  order: z.number().min(1, "Order must be at least 1"),
});

export const routeCreateSchema = z.object({
  execution_date: z.string().min(1, "Execution date is required"),
  estimated_volume: z.number().min(0, "Volume must be a positive number"),
  estimated_weight: z.number().min(0, "Weight must be a positive number"),
  planned_distance: z.number().min(0, "Distance must be a positive number"),
  planned_duration: z.number().min(0, "Duration must be a positive number"),
  vehicle_id: z.string().min(1, "Vehicle ID is required"),
  driver_id: z.string().min(1, "Driver ID is required"),
  stops: z.array(stopSchema).min(1, "At least one stop is required"),
});

export type RouteCreateFormValues = z.infer<typeof routeCreateSchema>;
