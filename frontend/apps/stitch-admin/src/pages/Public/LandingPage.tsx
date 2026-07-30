import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRegisterLeadApiV1CommercialLeadsPost } from '../../shared/api/generated/commercial/commercial'
import { Button } from '../../shared/ui/components/Button'
import { Input } from '../../shared/ui/components/Input'
import { toast } from 'sonner'
import { Leaf, ArrowRight, CheckCircle2 } from 'lucide-react'

export function LandingPage() {
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  
  const { mutate, isPending } = useRegisterLeadApiV1CommercialLeadsPost()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!companyName || !contactName) {
      toast.error('Por favor, preencha o Nome da Empresa e o Contato Principal.')
      return
    }

    mutate(
      { 
        data: { 
          company_name: companyName,
          contact_name: contactName,
          email: email || undefined,
          phone: phone || undefined,
          source_id: 'website_landing'
        } 
      },
      {
        onSuccess: () => {
          setIsSuccess(true)
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || 'Ocorreu um erro ao enviar sua solicitação.')
        }
      }
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2 text-brand-500 font-bold text-2xl tracking-tighter">
          <Leaf className="w-8 h-8" />
          DDN
        </div>
        <nav className="flex items-center gap-6">
          <a href="#services" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Serviços</a>
          <a href="#about" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Sobre Nós</a>
          <Button variant="ghost" className="text-zinc-300 hover:text-white" onClick={() => navigate('/login')}>
            Área do Cliente
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Value Proposition */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
              Gestão inteligente de <span className="text-brand-500">resíduos.</span>
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-xl">
              Simplifique a coleta e destinação dos resíduos da sua empresa com tecnologia de ponta, rastreabilidade total e conformidade ambiental.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-brand-500" />
                <span>Rastreabilidade de ponta a ponta</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-brand-500" />
                <span>Gestão 100% digital e segura</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-brand-500" />
                <span>Relatórios de conformidade e ESG</span>
              </div>
            </div>
          </div>

          {/* Lead Capture Form */}
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-brand-500/10 blur-[100px] rounded-full" />
            
            <div className="relative z-10">
              {isSuccess ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-brand-500" />
                  </div>
                  <h2 className="text-2xl font-bold">Solicitação Recebida!</h2>
                  <p className="text-zinc-400">
                    Nossa equipe comercial entrará em contato em breve para apresentar a melhor solução para sua empresa.
                  </p>
                  <Button className="mt-8 w-full" onClick={() => setIsSuccess(false)}>
                    Enviar Nova Solicitação
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2">Solicite um Orçamento</h2>
                  <p className="text-sm text-zinc-400 mb-8">
                    Preencha os dados abaixo e descubra como podemos otimizar sua operação.
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">Nome da Empresa *</label>
                      <Input 
                        placeholder="Ex: Indústria XYZ Ltda" 
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        disabled={isPending}
                        className="bg-zinc-950 border-white/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">Seu Nome *</label>
                      <Input 
                        placeholder="Ex: Maria Souza" 
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        disabled={isPending}
                        className="bg-zinc-950 border-white/10"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">E-mail</label>
                        <Input 
                          type="email"
                          placeholder="contato@xyz.com" 
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          disabled={isPending}
                          className="bg-zinc-950 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Telefone</label>
                        <Input 
                          placeholder="(11) 99999-9999" 
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          disabled={isPending}
                          className="bg-zinc-950 border-white/10"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full mt-6 py-6 text-base" disabled={isPending}>
                      {isPending ? 'Enviando...' : (
                        <>
                          Quero conhecer a plataforma <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-zinc-500 text-sm">
        &copy; {new Date().getFullYear()} DDN Waste Management. Todos os direitos reservados.
      </footer>
    </div>
  )
}
