import { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/ui/components/Modal';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { RouteResponseDTO } from '../../../../shared/api/generated/model/routeResponseDTO';
import type { LeadResponse } from '../../../../shared/api/generated/model/leadResponse';
import { useListLeadsApiV1CommercialLeadsGet } from '../../../../shared/api/generated/commercial/commercial';
import Markdown from 'react-markdown';
import L from 'leaflet';
import { Map as MapIcon } from 'lucide-react';

// Fix Leaflet's default icon paths for React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons
const StopIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ClientIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface RouteMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteResponseDTO | null;
}

// Haversine distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

export function RouteMapModal({ isOpen, onClose, route }: RouteMapModalProps) {
  const [nearbyClients, setNearbyClients] = useState<LeadResponse[]>([]);
  
  // Fetch leads to find nearby clients
  const { data: leads } = useListLeadsApiV1CommercialLeadsGet(undefined, {
    query: { enabled: isOpen && !!route }
  });

  useEffect(() => {
    if (leads && route?.stops && route.stops.length > 0) {
      // Find leads within 15km of ANY route stop
      const radiusKm = 15;
      
      const nearby = leads.filter((lead: LeadResponse) => {
        if (!lead.latitude || !lead.longitude) return false;
        
        return route.stops.some((stop: any) => {
          if (!stop.latitude || !stop.longitude) return false;
          const dist = calculateDistance(
            lead.latitude!, 
            lead.longitude!, 
            stop.latitude, 
            stop.longitude
          );
          return dist <= radiusKm;
        });
      });
      
      setNearbyClients(nearby);
    }
  }, [leads, route]);

  if (!route) return null;

  const validStops = route.stops?.filter((s: any) => s.latitude && s.longitude).sort((a: any, b: any) => a.order - b.order) || [];
  
  // Default to center of Sao Paulo or first stop
  const centerLat = validStops.length > 0 ? validStops[0].latitude : -23.5505;
  const centerLng = validStops.length > 0 ? validStops[0].longitude : -46.6333;
  
  const polylinePositions = validStops.map((s: any) => [s.latitude, s.longitude] as [number, number]);

  // Generate markdown instructions
  const markdownText = `
### Detalhes da Rota #${route.id.split('-')[0]}

**Data de Execução:** ${route.execution_date}
**Status:** ${route.status}

${route.stops && route.stops.length > 0 ? '#### Instruções de Coleta' : '*Nenhuma parada cadastrada nesta rota ainda.*'}

${validStops.map((stop: any, index: number) => `
**${index + 1}. Parada #${stop.order}**
- **Endereço:** ${stop.address || 'Não informado'}
- **Status:** ${stop.status}
`).join('\n')}

#### Clientes Próximos (${nearbyClients.length})
Você tem ${nearbyClients.length} leads em aberto a menos de 15km desta rota. Considere adicioná-los para otimizar o caminhão.
`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mapa e Planejamento da Rota" className="max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
        
        {/* Map Section */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden border border-surface-variant relative z-0">
          <MapContainer 
            center={[centerLat, centerLng]} 
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Draw polyline for stops */}
            {polylinePositions.length > 1 && (
              <Polyline positions={polylinePositions} color="#0055ff" weight={4} opacity={0.7} />
            )}

            {/* Stops Markers */}
            {validStops.map((stop: any, idx: number) => (
              <Marker 
                key={`stop-${stop.id}`} 
                position={[stop.latitude, stop.longitude]}
                icon={StopIcon}
              >
                <Popup>
                  <div className="font-sans">
                    <h3 className="font-bold text-sm">Parada {idx + 1}</h3>
                    <p className="text-xs text-gray-600 mt-1">{stop.address}</p>
                    <p className="text-xs font-semibold mt-1">Status: {stop.status}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Nearby Clients Markers */}
            {nearbyClients.map(client => (
              <Marker 
                key={`client-${client.id}`} 
                position={[client.latitude!, client.longitude!]}
                icon={ClientIcon}
              >
                <Popup>
                  <div className="font-sans">
                    <h3 className="font-bold text-sm text-brand-600">{client.company_name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{client.contact_name} ({client.phone})</p>
                    <p className="text-xs text-gray-500 mt-1">{client.address}</p>
                    <p className="text-xs font-semibold text-emerald-600 mt-1">Status: {client.status}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow border border-gray-200">
            <h4 className="text-xs font-bold mb-2 uppercase text-gray-500">Legenda</h4>
            <div className="flex items-center gap-2 mb-1 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div> Parada da Rota
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div> Cliente Próximo
            </div>
          </div>
        </div>

        {/* Markdown Details Section */}
        <div className="bg-surface-white border border-surface-variant rounded-xl p-6 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 text-brand-500 pb-4 border-b border-surface-variant">
            <MapIcon size={20} />
            <h2 className="font-semibold">Relatório Logístico</h2>
          </div>
          
          <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
            <Markdown>{markdownText}</Markdown>
          </div>
        </div>
        
      </div>
    </Modal>
  );
}
