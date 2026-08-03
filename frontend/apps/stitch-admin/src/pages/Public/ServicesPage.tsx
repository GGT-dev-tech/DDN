import { Factory, Recycle, Activity, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/ui/components/Button'

export function ServicesPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-8 py-16 space-y-24">
      
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-6">
          Gestão Integrada de Resíduos
        </h1>
        <p className="text-lg text-on-surface-variant leading-relaxed">
          Oferecemos soluções completas para a destinação de resíduos industriais e de saúde. Nosso escopo cobre desde o gerenciamento da fonte geradora até o licenciamento e destinação final ambientalmente correta.
        </p>
      </section>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        
        {/* Gestão Industrial */}
        <div className="bg-surface-white/80 backdrop-blur-md border border-surface-variant p-8 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-soft transition-all">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-brand-50 rounded-full blur-[40px] opacity-50 group-hover:bg-brand-100 transition-colors"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500 mb-6">
              <Factory className="w-7 h-7" />
            </div>
            
            <h2 className="text-2xl font-bold text-on-surface mb-4">Resíduos Industriais</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              Executamos o gerenciamento completo dos resíduos industriais (Classes I, IIA e IIB), reduzindo os riscos ambientais, operacionais e jurídicos do seu negócio.
            </p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <ChevronRight className="w-4 h-4 text-brand-500" /> Coleta Especializada e Transporte Segurado
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <ChevronRight className="w-4 h-4 text-brand-500" /> Armazenamento Temporário e Triagem
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <ChevronRight className="w-4 h-4 text-brand-500" /> Emissão de MTR e Certificado de Destinação Final (CDF)
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <ChevronRight className="w-4 h-4 text-brand-500" /> Destinação de Óleos, Borras, Tintas, Solventes e EPIs
              </li>
            </ul>
          </div>
        </div>

        {/* Resíduos de Saúde */}
        <div className="bg-surface-white/80 backdrop-blur-md border border-surface-variant p-8 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-soft transition-all">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-alert-lime/20 rounded-full blur-[40px] opacity-50 group-hover:bg-alert-lime/30 transition-colors"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-alert-lime/30 rounded-2xl flex items-center justify-center text-waste-green mb-6">
              <Activity className="w-7 h-7" />
            </div>
            
            <h2 className="text-2xl font-bold text-on-surface mb-4">Resíduos de Saúde (RSS)</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              Atendimento especializado para hospitais, clínicas e laboratórios, seguindo rigorosamente a RDC 222-2018 da ANVISA para os Grupos A, B, C, D e E.
            </p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <ChevronRight className="w-4 h-4 text-waste-green" /> Segregação e Acondicionamento Normatizado
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <ChevronRight className="w-4 h-4 text-waste-green" /> Tratamento Térmico (Autoclave/Incineração)
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <ChevronRight className="w-4 h-4 text-waste-green" /> Controle de Riscos Biológicos e Perfurocortantes
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <ChevronRight className="w-4 h-4 text-waste-green" /> Rastreabilidade e Relatórios ANVISA
              </li>
            </ul>
          </div>
        </div>

        {/* Logística Reversa */}
        <div className="bg-surface-white/80 backdrop-blur-md border border-surface-variant p-8 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-soft transition-all lg:col-span-2">
          <div className="absolute left-1/2 -top-32 w-96 h-96 bg-data-blue/10 rounded-full blur-[80px] opacity-50 group-hover:bg-data-blue/20 transition-colors"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="w-14 h-14 bg-data-blue/10 rounded-2xl flex items-center justify-center text-data-blue mb-6">
                <Recycle className="w-7 h-7" />
              </div>
              
              <h2 className="text-2xl font-bold text-on-surface mb-4">Logística Reversa & Economia Circular</h2>
              <p className="text-on-surface-variant mb-6 leading-relaxed">
                Reintegramos materiais ao ciclo produtivo sempre que viável, em alinhamento total à Política Nacional de Resíduos Sólidos (PNRS). Uma abordagem moderna que valoriza resíduos ao invés de aterrá-los.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <ChevronRight className="w-4 h-4 text-data-blue" /> Sistema BULBOX®
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <ChevronRight className="w-4 h-4 text-data-blue" /> Eletroeletrônicos
                  </li>
                </ul>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <ChevronRight className="w-4 h-4 text-data-blue" /> Lâmpadas e Vidros
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <ChevronRight className="w-4 h-4 text-data-blue" /> Reciclagem de Plásticos e Metais
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="w-full md:w-1/3 flex justify-center">
               <Link to="/#contato">
                 <Button className="bg-brand-500 text-white h-14 px-8 w-full md:w-auto shadow-md hover:bg-waste-green transition-all">
                   Solicitar Orçamento
                 </Button>
               </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
