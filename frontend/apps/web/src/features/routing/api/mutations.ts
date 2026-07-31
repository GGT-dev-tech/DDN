import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createRouteApiV1RoutingRoutesPost,
  assignRouteResourcesApiV1RoutingRoutesRouteIdAssignPost,
  addStopToRouteApiV1RoutingRoutesRouteIdStopsPost
} from "@repo/api";
import { RouteCreateFormValues } from "../model/schemas";

export function useCreateRouteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RouteCreateFormValues) => {
      // Step 1: Create the base route
      const createResponse = await createRouteApiV1RoutingRoutesPost({
        execution_date: data.execution_date,
        estimated_volume: data.estimated_volume,
        estimated_weight: data.estimated_weight,
        planned_distance: data.planned_distance,
        planned_duration: data.planned_duration,
      });

      // Handle the fact that Orval might return the object directly or { data } depending on axios vs fetch
      // Our customClient returns the JSON payload directly (see custom-client.ts)
      const routeId = (createResponse as any).id;
      if (!routeId) {
        throw new Error("Failed to create base route");
      }

      // Step 2: Assign resources
      await assignRouteResourcesApiV1RoutingRoutesRouteIdAssignPost(routeId, {
        route_id: routeId,
        vehicle_id: data.vehicle_id,
        driver_id: data.driver_id,
      });

      // Step 3: Add stops
      for (const stop of data.stops) {
        await addStopToRouteApiV1RoutingRoutesRouteIdStopsPost(routeId, {
          route_id: routeId,
          location: {
            latitude: stop.latitude,
            longitude: stop.longitude,
            address: stop.address,
          },
          order: stop.order,
        });
      }

      return routeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });
}
