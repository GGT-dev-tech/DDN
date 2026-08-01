import { useQuery } from "@tanstack/react-query";
import { RouteResponseDTO } from "@repo/api";
import { mapRouteToUI } from "../../../entities/route/api/mapper";

// TODO: Replace with Orval generated clients once GET endpoints are added to the OpenAPI spec
async function fetchRoutes(): Promise<RouteResponseDTO[]> {
  const response = await fetch("https://backend-production-946f.up.railway.app/api/v1/routes");
  if (!response.ok) throw new Error("Failed to fetch routes");
  return response.json();
}

async function fetchRouteById(routeId: string): Promise<RouteResponseDTO> {
  const response = await fetch(`https://backend-production-946f.up.railway.app/api/v1/routes/${routeId}`);
  if (!response.ok) throw new Error("Failed to fetch route");
  return response.json();
}

export function useRoutesQuery() {
  return useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const data = await fetchRoutes();
      return data.map(mapRouteToUI);
    },
  });
}

export function useRouteQuery(routeId: string) {
  return useQuery({
    queryKey: ["routes", routeId],
    queryFn: async () => {
      const data = await fetchRouteById(routeId);
      return mapRouteToUI(data);
    },
    enabled: !!routeId,
  });
}
