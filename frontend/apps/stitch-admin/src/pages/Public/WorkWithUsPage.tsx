import { useState } from 'react'
import { Briefcase, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '../../shared/ui/components/Button'
import { Input } from '../../shared/ui/components/Input'
import { toast } from 'sonner'

export function WorkWithUsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call for CV submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      toast.success('Currículo enviado com sucesso!')
    }, 1500)
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-8 py-16">
      
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Text Section */}
        <div className="space-y-6">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-500 mb-6">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
            Trabalhe Conosco
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Faça parte de uma equipe dedicada à sustentabilidade e à inovação na gestão ambiental. Na DDN, valorizamos profissionais comprometidos, éticos e que desejam transformar o futuro do nosso planeta.
          </p>
          
          <div className="pt-6 border-t border-surface-variant">
            <h3 className="font-bold text-on-surface mb-4">Por que a DDN?</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <CheckCircle2 className="w-5 h-5 text-waste-green" /> Ambiente de trabalho dinâmico e focado em ESG.
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <CheckCircle2 className="w-5 h-5 text-waste-green" /> Oportunidades de crescimento e capacitação contínua.
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <CheckCircle2 className="w-5 h-5 text-waste-green" /> Trabalho com propósito real: proteger o meio ambiente.
              </li>
            </ul>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-surface-white/80 backdrop-blur-xl border border-surface-variant p-8 md:p-10 rounded-3xl shadow-soft relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-brand-500 to-transparent"></div>
          
          {isSuccess ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-waste-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-waste-green" />
              </div>
              <h2 className="text-2xl font-bold text-on-surface">Inscrição Recebida!</h2>
              <p className="text-on-surface-variant">
                Seu currículo foi encaminhado ao nosso time de Recursos Humanos. Entraremos em contato caso haja uma vaga compatível com o seu perfil.
              </p>
              <Button className="mt-8 bg-surface-variant text-on-surface" onClick={() => setIsSuccess(false)}>
                Enviar Novo Currículo
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-on-surface mb-2">Envie seu Currículo</h2>
              <p className="text-sm text-on-surface-variant mb-8">
                Preencha os dados abaixo e anexe seu currículo (PDF).
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface">Nome Completo *</label>
                  <Input required placeholder="Ex: João Silva" disabled={isSubmitting} className="bg-surface-bright" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface">E-mail *</label>
                    <Input type="email" required placeholder="joao@email.com" disabled={isSubmitting} className="bg-surface-bright" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface">Telefone / WhatsApp</label>
                    <Input placeholder="(11) 90000-0000" disabled={isSubmitting} className="bg-surface-bright" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface">Área de Interesse</label>
                  <select className="w-full h-10 px-3 py-2 bg-surface-bright border border-surface-variant rounded-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" disabled={isSubmitting}>
                    <option>Logística e Transporte</option>
                    <option>Operacional (Triagem/Tratamento)</option>
                    <option>Comercial / Vendas</option>
                    <option>Administrativo / Financeiro</option>
                    <option>Engenharia Ambiental</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface">Link do LinkedIn (Opcional)</label>
                  <Input placeholder="https://linkedin.com/in/seu-perfil" disabled={isSubmitting} className="bg-surface-bright" />
                </div>

                <Button type="submit" className="w-full h-12 text-base font-semibold bg-brand-500 text-white shadow-md hover:bg-waste-green transition-all mt-4" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : (
                    <>
                      Enviar Candidatura <Send className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
