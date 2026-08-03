import { useState } from 'react'

import { Button } from '../../shared/ui/components/Button'
import { Input } from '../../shared/ui/components/Input'
import { toast } from 'sonner'
import { Leaf, ArrowRight, CheckCircle2, ShieldCheck, Factory, Recycle, FileCheck2, ArrowLeftRight } from 'lucide-react'

export function LandingPage() {
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!companyName || !contactName) {
      toast.error('Por favor, preencha o Nome da Empresa e o Contato Principal.')
      return
    }

    setIsPending(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/public/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_name: companyName,
          contact_name: contactName,
          email: email || undefined,
          phone: phone || undefined,
          source_id: 'website_landing'
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Ocorreu um erro ao enviar sua solicitação.')
      }

      setIsSuccess(true)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="w-full flex flex-col font-sans">
      <main className="flex-1 pb-20">
        
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center px-8 max-w-7xl mx-auto overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e2e2_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>
          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
            <div className="space-y-8">
              <span className="font-mono text-xs text-tertiary-container uppercase tracking-wider mb-4 block border border-tertiary-container/30 px-3 py-1 rounded-full w-max bg-surface-container-low">
                TECNOLOGIA & SUSTENTABILIDADE
              </span>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-on-surface">
                Destinação de Resíduos <br/>
                <span className="bg-gradient-to-r from-brand-500 to-data-blue bg-clip-text text-transparent">
                  Inteligente e Sustentável
                </span>
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl">
                Integramos dados precisos, emissão automática de MTRs e economia circular para otimizar a gestão ambiental da sua empresa. Menos risco, mais transparência.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button className="bg-brand-500 text-white h-14 px-8 text-base shadow-soft hover:-translate-y-1 transition-transform" onClick={() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth'})}>
                  Solicitar Orçamento Rápido
                </Button>
                <Button variant="ghost" className="h-14 px-8 text-base border border-outline text-on-surface hover:bg-surface-container-low">
                  Conhecer Nossas Licenças
                </Button>
              </div>
            </div>

            {/* Quick Form in Hero */}
            <div className="bg-surface-white border border-surface-variant p-8 rounded-2xl shadow-soft relative" id="contato">
              <div className="relative z-10">
                {isSuccess ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-8 h-8 text-brand-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-on-surface">Solicitação Recebida!</h2>
                    <p className="text-on-surface-variant">
                      Nossa equipe especializada entrará em contato em breve para apresentar a melhor solução.
                    </p>
                    <Button className="mt-8 w-full bg-brand-500 text-white" onClick={() => setIsSuccess(false)}>
                      Enviar Nova Solicitação
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-2 text-on-surface">Fale com um Especialista</h2>
                    <p className="text-sm text-on-surface-variant mb-8">
                      Preencha os dados e descubra como otimizar sua operação de resíduos industriais e de saúde.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface">Nome da Empresa *</label>
                        <Input 
                          placeholder="Ex: Indústria XYZ Ltda" 
                          value={companyName}
                          onChange={e => setCompanyName(e.target.value)}
                          disabled={isPending}
                          className="bg-surface-bright"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface">Seu Nome *</label>
                        <Input 
                          placeholder="Ex: Maria Souza" 
                          value={contactName}
                          onChange={e => setContactName(e.target.value)}
                          disabled={isPending}
                          className="bg-surface-bright"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-on-surface">E-mail</label>
                          <Input 
                            type="email"
                            placeholder="contato@xyz.com" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={isPending}
                            className="bg-surface-bright"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-on-surface">Telefone</label>
                          <Input 
                            placeholder="(11) 99999-9999" 
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            disabled={isPending}
                            className="bg-surface-bright"
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full mt-6 py-6 text-base bg-brand-500 text-white hover:bg-waste-green" disabled={isPending}>
                        {isPending ? 'Enviando...' : (
                          <>
                            Solicitar Contato <ArrowRight className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Bottom Bar */}
        <div className="border-y border-surface-variant bg-surface-bright mt-12 hidden md:block">
          <div className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Recycle className="w-10 h-10 text-brand-500" />
              <div>
                <p className="text-3xl font-bold text-on-surface leading-none">94%</p>
                <p className="text-xs font-mono text-on-surface-variant uppercase mt-1">TAXA DE RECICLAGEM</p>
              </div>
            </div>
            <div className="h-12 w-px bg-surface-variant"></div>
            <div className="flex items-center gap-4">
              <Factory className="w-10 h-10 text-tertiary-container" />
              <div>
                <p className="text-3xl font-bold text-on-surface leading-none">+500</p>
                <p className="text-xs font-mono text-on-surface-variant uppercase mt-1">INDÚSTRIAS ATENDIDAS</p>
              </div>
            </div>
            <div className="h-12 w-px bg-surface-variant"></div>
            <div className="flex items-center gap-4">
              <Leaf className="w-10 h-10 text-data-blue" />
              <div>
                <p className="text-3xl font-bold text-on-surface leading-none">12.5 T</p>
                <p className="text-xs font-mono text-on-surface-variant uppercase mt-1">CO2 EVITADO MENSALMENTE</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <section id="servicos" className="py-24 px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-on-surface mb-4">Nossas Soluções</h2>
            <p className="text-lg text-on-surface-variant">
              Atendemos de forma integral as demandas de destinação, de acordo com as normas da ABNT NBR 10004 e ANVISA.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-surface-white border border-surface-variant rounded-2xl p-8 shadow-sm hover:shadow-soft transition-shadow">
              <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500 mb-6">
                <Factory size={28} />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Resíduos Industriais</h3>
              <p className="text-on-surface-variant mb-4">
                Gerenciamento completo para Classes I (Perigosos), IIA (Não Inertes) e IIB (Inertes). Da coleta especializada ao tratamento e destinação final.
              </p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-500"/> Óleos, solventes e tintas</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-500"/> EPIs contaminados</li>
              </ul>
            </div>

            <div className="bg-surface-white border border-surface-variant rounded-2xl p-8 shadow-sm hover:shadow-soft transition-shadow">
              <div className="w-14 h-14 bg-alert-lime/20 rounded-xl flex items-center justify-center text-waste-green mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Serviços de Saúde (RSS)</h3>
              <p className="text-on-surface-variant mb-4">
                Coleta segura seguindo a RDC 222-2018 para hospitais e clínicas. Atendemos Grupos A ao E com total rastreabilidade.
              </p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-500"/> Infectantes e Biológicos</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-500"/> Perfurocortantes e Químicos</li>
              </ul>
            </div>

            <div className="bg-surface-white border border-surface-variant rounded-2xl p-8 shadow-sm hover:shadow-soft transition-shadow">
              <div className="w-14 h-14 bg-data-blue/10 rounded-xl flex items-center justify-center text-data-blue mb-6">
                <ArrowLeftRight size={28} />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Logística Reversa</h3>
              <p className="text-on-surface-variant mb-4">
                Reintegração de materiais ao ciclo produtivo, alinhado à PNRS. Foco em Economia Circular e ESG.
              </p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-500"/> Sistema BULBOX®</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-500"/> Eletroeletrônicos e Lâmpadas</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Compliance Section */}
        <section id="compliance" className="py-24 bg-surface-bright border-y border-surface-variant">
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-on-surface mb-6">Segurança e Compliance Ambiental</h2>
              <p className="text-lg text-on-surface-variant mb-8">
                Operamos 100% integrados ao SINIR. Emitimos de forma automatizada toda a documentação necessária para as suas auditorias ambientais.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1"><FileCheck2 className="w-6 h-6 text-brand-500" /></div>
                  <div>
                    <h4 className="font-bold text-on-surface">MTRs e CDFs Garantidos</h4>
                    <p className="text-sm text-on-surface-variant">Acompanhe a emissão dos Manifestos de Transporte e Certificados de Destinação Final via painel digital.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1"><ShieldCheck className="w-6 h-6 text-brand-500" /></div>
                  <div>
                    <h4 className="font-bold text-on-surface">Órgãos Reguladores</h4>
                    <p className="text-sm text-on-surface-variant">Nossas bases e parceiros são totalmente licenciados por IBAMA, IMA e ANVISA.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface-white p-8 rounded-2xl shadow-soft border border-surface-variant relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-tertiary-container rounded-3xl blur opacity-20"></div>
              <div className="relative bg-surface-white rounded-xl p-6">
                 <h4 className="font-mono text-sm uppercase tracking-wider text-tertiary-container mb-4">Relatório de Rastreabilidade (Exemplo)</h4>
                 <div className="space-y-3 font-mono text-xs text-on-surface-variant">
                   <div className="flex justify-between border-b border-surface-variant pb-2">
                     <span>ID_ROTA</span><span className="font-bold text-on-surface">R-88392A</span>
                   </div>
                   <div className="flex justify-between border-b border-surface-variant pb-2">
                     <span>CLASSE_RESIDUO</span><span className="font-bold text-on-surface">I (Perigosos)</span>
                   </div>
                   <div className="flex justify-between border-b border-surface-variant pb-2">
                     <span>MTR_GERADO</span><span className="text-brand-500 font-bold">SIM (SINIR-SC)</span>
                   </div>
                   <div className="flex justify-between border-b border-surface-variant pb-2">
                     <span>DESTINACAO_FINAL</span><span className="font-bold text-on-surface">Incineração</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
