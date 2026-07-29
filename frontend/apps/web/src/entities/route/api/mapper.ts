import { RouteResponseDTO, StopResponseDTO } from "@repo/api";
import { RouteUI, RouteStatus, RouteStopUI, StopStatus } from "../model/types";

function mapRouteStatus(status: string): RouteStatus {
  const map: Record<string, RouteStatus> = {
    'DRAFT': 'DRAFT',
    'PLANNED': 'PLANNED',
    'IN_PROGRESS': 'IN_PROGRESS',
    'COMPLETED': 'COMPLETED',
    'CANCELLED': 'CANCELLED',
  };
  return map[status.toUpperCase()] || 'UNKNOWN';
}

function getRouteStatusInfo(status: RouteStatus): { label: string; color: string } {
  const map: Record<RouteStatus, { label: string; color: string }> = {
    'DRAFT': { label: 'Rascunho', color: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
    'PLANNED': { label: 'Planejada', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    'IN_PROGRESS': { label: 'Em Progresso', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    'COMPLETED': { label: 'Concluída', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'CANCELLED': { label: 'Cancelada', color: 'bg-red-50 text-red-700 border-red-200' },
    'UNKNOWN': { label: 'Desconhecido', color: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
  };
  return map[status];
}

function mapStopStatus(status: string): StopStatus {
  const map: Record<string, StopStatus> = {
    'PENDING': 'PENDING',
    'ARRIVED': 'ARRIVED',
    'COLLECTED': 'COLLECTED',
    'FAILED': 'FAILED',
  };
  return map[status.toUpperCase()] || 'UNKNOWN';
}

function getStopStatusInfo(status: StopStatus): { label: string; color: string } {
  const map: Record<StopStatus, { label: string; color: string }> = {
    'PENDING': { label: 'Pendente', color: 'bg-zinc-100 text-zinc-700' },
    'ARRIVED': { label: 'No Local', color: 'bg-blue-50 text-blue-700' },
    'COLLECTED': { label: 'Coletado', color: 'bg-emerald-50 text-emerald-700' },
    'FAILED': { label: 'Falhou', color: 'bg-red-50 text-red-700' },
    'UNKNOWN': { label: '?', color: 'bg-zinc-100 text-zinc-700' },
  };
  return map[status];
}

export function mapStopToUI(dto: StopResponseDTO): RouteStopUI {
  const status = mapStopStatus(dto.status);
  const info = getStopStatusInfo(status);
  
  return {
    id: dto.id,
    order: dto.order,
    address: dto.address,
    latitude: dto.latitude,
    longitude: dto.longitude,
    status,
    statusLabel: info.label,
    statusColor: info.color,
  };
}

export function mapRouteToUI(dto: RouteResponseDTO): RouteUI {
  const status = mapRouteStatus(dto.status);
  const info = getRouteStatusInfo(status);
  
  // Note: the DTO values might come as primitive numbers or objects depending on Orval.
  // We'll safely parse them assuming they might be objects or numbers.
  const estVol = typeof dto.estimated_volume === 'number' ? dto.estimated_volume : 0;
  const estWeight = typeof dto.estimated_weight === 'number' ? dto.estimated_weight : 0;
  const dist = typeof dto.planned_distance === 'number' ? dto.planned_distance : 0;
  const dur = typeof dto.planned_duration === 'number' ? dto.planned_duration : 0;

  // Driver/Vehicle strings or objects
  const vId = typeof dto.vehicle_id === 'string' ? dto.vehicle_id : undefined;
  const dId = typeof dto.driver_id === 'string' ? dto.driver_id : undefined;

  return {
    id: dto.id,
    executionDate: new Date(dto.execution_date).toLocaleDateString('pt-BR'),
    status,
    statusLabel: info.label,
    statusColor: info.color,
    
    stopsCount: dto.stops?.length || 0,
    stops: (dto.stops || []).map(mapStopToUI).sort((a, b) => a.order - b.order),
    
    estimatedVolume: estVol,
    estimatedWeight: estWeight,
    plannedDistance: dist,
    plannedDuration: dur,
    
    vehicleId: vId,
    driverId: dId,
  };
}
