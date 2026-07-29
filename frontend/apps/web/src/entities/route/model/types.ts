export type RouteStatus = 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'UNKNOWN';
export type StopStatus = 'PENDING' | 'ARRIVED' | 'COLLECTED' | 'FAILED' | 'UNKNOWN';

export interface RouteStopUI {
  id: string;
  order: number;
  address: string;
  latitude: number;
  longitude: number;
  status: StopStatus;
  statusLabel: string;
  statusColor: string;
}

export interface RouteUI {
  id: string;
  executionDate: string; // formatted date
  status: RouteStatus;
  statusLabel: string;
  statusColor: string;
  
  stopsCount: number;
  stops: RouteStopUI[];
  
  estimatedVolume?: number;
  estimatedWeight?: number;
  plannedDistance?: number;
  plannedDuration?: number;
  
  vehicleId?: string;
  driverId?: string;
}
