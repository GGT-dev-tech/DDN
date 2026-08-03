
import { X, Truck, AlertCircle, PlusCircle, MapPin } from 'lucide-react'
import { Button } from '../../../shared/ui/components/Button'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import ReactMarkdown from 'react-markdown'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default Leaflet icons in Vite/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface RouteDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  route: any
}

// Simulated Nearby Pending Requests for the "Consolidação" insight
const nearbyRequests = [
  { id: '1', client: 'Condomínio Verde', weight: '1.2 TONS', dist: '4.5km', class: 'IIB' },
  { id: '2', client: 'Indústria Beta', weight: '0.8 TONS', dist: '6.2km', class: 'I' },
]

export function RouteDetailsModal({ isOpen, onClose, route }: RouteDetailsModalProps) {
  if (!isOpen || !route) return null

  // Simulated Coordinates for the route (Start -> Mid -> End)
  // In a real app, these would come from `route.path` or `route.waypoints`
  const waypoints = [
    { lat: -23.5505, lng: -46.6333, title: 'Base Operacional', type: 'START', md: `**Base Sul**\n- Partida: 08:00\n- Veículo: Caminhão ABC-1234\n- Status: Início da Rota` },
    { lat: -23.5605, lng: -46.6433, title: 'Cliente XYZ', type: 'STOP', md: `**Indústria XYZ Ltda**\n- Coleta: Resíduos Classe I (Perigosos)\n- Peso Est.: 2.5 TONS\n- MTR: Gerado (SINIR-SC)` },
    { lat: -23.5705, lng: -46.6233, title: 'Aterro Sanitário', type: 'END', md: `**Destinação Final**\n- Local: Central de Tratamento\n- Prev. Chegada: 15:00\n- Ação: Descarga e CDF` },
  ]

  const polylineCoords: [number, number][] = waypoints.map(w => [w.lat, w.lng])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-surface-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden border border-surface-variant">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-variant flex items-center justify-between bg-surface-bright">
          <div>
            <h2 className="text-xl font-bold text-on-surface">
              Rota {route.id?.substring(0, 8).toUpperCase()}
            </h2>
            <p className="text-sm text-on-surface-variant">
              Visualização de itinerário e otimização
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
            <X size={20} />
          </button>
        </div>

        {/* Content Body - Split View */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Panel: Map */}
          <div className="flex-1 relative bg-surface-container-low min-h-[400px]">
            <MapContainer 
              center={[-23.5605, -46.6333]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {waypoints.map((wp, idx) => (
                <Marker key={idx} position={[wp.lat, wp.lng]}>
                  <Popup className="markdown-popup">
                    <div className="prose prose-sm prose-zinc">
                      <ReactMarkdown>{wp.md}</ReactMarkdown>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              <Polyline positions={polylineCoords} color="#0d631b" weight={4} opacity={0.7} />
            </MapContainer>
          </div>

          {/* Right Panel: Logistics Optimization */}
          <div className="w-full lg:w-[400px] border-l border-surface-variant bg-surface-white flex flex-col overflow-y-auto">
            <div className="p-6 space-y-6">
              
              {/* Route Summary */}
              <div>
                <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-3">Resumo da Rota</h3>
                <div className="p-4 rounded-xl border border-surface-variant bg-surface-bright space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500">
                      <Truck size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Caminhão ABC-1234</p>
                      <p className="text-xs text-on-surface-variant">Ocupação Atual: 65% (8.5T)</p>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2">
                    <div className="bg-brand-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>

              {/* Nearby Clients Insight (from prototype) */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={16} className="text-waste-green" />
                  <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider">Oportunidades Próximas</h3>
                </div>
                <p className="text-xs text-on-surface-variant mb-4">
                  Existem clientes com coletas pendentes no raio desta rota. Otimize o espaço vazio do caminhão.
                </p>

                <div className="space-y-3">
                  {nearbyRequests.map(req => (
                    <div key={req.id} className="p-3 border border-outline-variant rounded-lg bg-surface-bright hover:border-waste-green transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-on-surface">{req.client}</span>
                        <span className="text-xs font-mono font-bold text-waste-green">{req.weight}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mb-3">
                        <MapPin size={12} className="inline mr-1"/>
                        {req.dist} da rota • Resíduo: {req.class}
                      </p>
                      <Button variant="ghost" className="w-full h-8 text-xs gap-1 border border-waste-green text-waste-green hover:bg-brand-50">
                        <PlusCircle size={14} /> Adicionar à Rota
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
