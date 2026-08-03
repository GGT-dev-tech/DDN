import { useState } from 'react'
import { useRegisterLeadApiV1CommercialLeadsPost } from '../../../shared/api/generated/commercial/commercial'
import { Button } from '../../../shared/ui/components/Button'
import { Input } from '../../../shared/ui/components/Input'
import { toast } from 'sonner'
import { Search, RefreshCw, CheckCircle2 } from 'lucide-react'

interface CustomerFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CustomerForm({ onSuccess, onCancel }: CustomerFormProps) {
  const [cnpj, setCnpj] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [cep, setCep] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  
  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false)
  const [isFetchingCep, setIsFetchingCep] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  
  const { mutate, isPending } = useRegisterLeadApiV1CommercialLeadsPost()

  const handleCnpjBlur = async () => {
    const cleanCnpj = cnpj.replace(/\D/g, '')
    if (cleanCnpj.length !== 14) return

    setIsFetchingCnpj(true)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`)
      if (!res.ok) throw new Error('CNPJ não encontrado')
      const data = await res.json()
      
      setCompanyName(data.razao_social || '')
      setPhone(data.ddd_telefone_1 || '')
      setEmail(data.email || '')
      
      if (data.cep) {
        setCep(data.cep)
        fetchAddressByCep(data.cep)
      }
      toast.success('Dados da empresa carregados!')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao buscar CNPJ')
    } finally {
      setIsFetchingCnpj(false)
    }
  }

  const fetchAddressByCep = async (cepCode: string) => {
    const cleanCep = cepCode.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    setIsFetchingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await res.json()
      if (data.erro) throw new Error('CEP não encontrado')
      
      const fullAddress = `${data.logradouro}, , ${data.bairro}, ${data.localidade} - ${data.uf}, ${data.cep}`
      setAddress(fullAddress)
      toast.success('Endereço carregado!')
      
      // Auto-trigger geocoding
      geocodeAddress(fullAddress)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao buscar CEP')
    } finally {
      setIsFetchingCep(false)
    }
  }

  const handleCepBlur = () => {
    if (cep) fetchAddressByCep(cep)
  }

  const geocodeAddress = async (addrToSearch: string) => {
    if (!addrToSearch) return
    setIsGeocoding(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addrToSearch)}`)
      const data = await res.json()
      if (data && data.length > 0) {
        setLatitude(data[0].lat)
        setLongitude(data[0].lon)
        toast.success('Coordenadas geradas com sucesso!')
      } else {
        toast.error('Não foi possível encontrar as coordenadas para este endereço.')
      }
    } catch (err: any) {
      toast.error('Erro ao buscar coordenadas.')
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleAddressBlur = () => {
    if (address && !latitude && !longitude) {
      geocodeAddress(address)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!companyName || !contactName) {
      toast.error('Por favor, preencha os campos obrigatórios (Empresa e Contato).')
      return
    }

    mutate(
      { 
        data: { 
          company_name: companyName,
          contact_name: contactName,
          email: email || undefined,
          phone: phone || undefined,
          address: address || undefined,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined
        } 
      },
      {
        onSuccess: () => {
          toast.success('Cliente (Lead) cadastrado com sucesso!')
          onSuccess?.()
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || 'Ocorreu um erro ao cadastrar o cliente.')
        }
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Automations Section */}
      <div className="bg-brand-500/5 p-4 rounded-xl border border-brand-500/20 space-y-4">
        <h3 className="text-sm font-semibold text-brand-500 flex items-center gap-2">
          <Search size={16} />
          Preenchimento Inteligente
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">Consultar CNPJ</label>
            <div className="relative">
              <Input 
                placeholder="Ex: 00.000.000/0000-00" 
                value={cnpj}
                onChange={(e: any) => setCnpj(e.target.value)}
                onBlur={handleCnpjBlur}
                disabled={isPending || isFetchingCnpj}
              />
              {isFetchingCnpj && (
                <div className="absolute right-3 top-2.5">
                  <RefreshCw size={16} className="animate-spin text-brand-500" />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">Consultar CEP</label>
            <div className="relative">
              <Input 
                placeholder="Ex: 01001-000" 
                value={cep}
                onChange={(e: any) => setCep(e.target.value)}
                onBlur={handleCepBlur}
                disabled={isPending || isFetchingCep}
              />
              {isFetchingCep && (
                <div className="absolute right-3 top-2.5">
                  <RefreshCw size={16} className="animate-spin text-brand-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Nome da Empresa *</label>
        <Input 
          placeholder="Ex: Indústria XYZ Ltda" 
          value={companyName}
          onChange={(e: any) => setCompanyName(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Nome do Contato Principal *</label>
        <Input 
          placeholder="Ex: Maria Souza" 
          value={contactName}
          onChange={(e: any) => setContactName(e.target.value)}
          disabled={isPending}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">E-mail</label>
          <Input 
            type="email"
            placeholder="contato@xyz.com" 
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Telefone</label>
          <Input 
            placeholder="(11) 99999-9999" 
            value={phone}
            onChange={(e: any) => setPhone(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Endereço Completo</label>
          {isGeocoding && <span className="text-xs text-brand-500 flex items-center gap-1"><RefreshCw size={12} className="animate-spin" /> Buscando coordenadas...</span>}
        </div>
        <Input 
          placeholder="Rua Exemplo, 123, Bairro, Cidade - Estado" 
          value={address}
          onChange={(e: any) => setAddress(e.target.value)}
          onBlur={handleAddressBlur}
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            Latitude {latitude && <CheckCircle2 size={12} className="text-emerald-500" />}
          </label>
          <Input 
            type="number"
            step="any"
            placeholder="-23.5505" 
            value={latitude}
            onChange={(e: any) => setLatitude(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            Longitude {longitude && <CheckCircle2 size={12} className="text-emerald-500" />}
          </label>
          <Input 
            type="number"
            step="any"
            placeholder="-46.6333" 
            value={longitude}
            onChange={(e: any) => setLongitude(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="glass" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar Cliente'}
        </Button>
      </div>
    </form>
  )
}
