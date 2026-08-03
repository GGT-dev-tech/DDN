import { Factory, Leaf, ShieldCheck } from 'lucide-react'

export function AboutPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-8 py-16 space-y-24">
      
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-on-surface">
          Transformando Desafios em <span className="bg-gradient-to-r from-brand-500 to-waste-green bg-clip-text text-transparent">Valor Ambiental</span>
        </h1>
        <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed">
          A DDN Resíduos atua há mais de 10 anos no gerenciamento inteligente e na destinação final de resíduos industriais e de saúde. Nosso foco é garantir total compliance, segurança jurídica e eficiência para nossos clientes.
        </p>
      </section>

      {/* Glassmorphic Values Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-brand-50 rounded-3xl blur-[80px] opacity-50"></div>
        
        <div className="relative grid md:grid-cols-3 gap-8">
          
          <div className="bg-surface-white/60 backdrop-blur-xl border border-surface-variant p-8 rounded-3xl shadow-soft">
            <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500 mb-6">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Segurança Jurídica</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Agimos estritamente de acordo com as normativas da PNRS, ANVISA e IBAMA. Todos os processos são rastreáveis, desde a coleta até o Certificado de Destinação Final (CDF).
            </p>
          </div>

          <div className="bg-surface-white/60 backdrop-blur-xl border border-surface-variant p-8 rounded-3xl shadow-soft">
            <div className="w-14 h-14 bg-waste-green/10 rounded-2xl flex items-center justify-center text-waste-green mb-6">
              <Leaf className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Sustentabilidade</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Através da logística reversa e economia circular, reintegramos materiais ao ciclo produtivo sempre que viável, reduzindo o impacto ambiental.
            </p>
          </div>

          <div className="bg-surface-white/60 backdrop-blur-xl border border-surface-variant p-8 rounded-3xl shadow-soft">
            <div className="w-14 h-14 bg-data-blue/10 rounded-2xl flex items-center justify-center text-data-blue mb-6">
              <Factory className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Excelência Operacional</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Equipes treinadas, frota especializada e tecnologia de ponta para acompanhamento logístico em tempo real de cargas Classe I, IIA e IIB.
            </p>
          </div>

        </div>
      </section>

      {/* History/Text Section */}
      <section className="grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-on-surface">Nossa Trajetória</h2>
          <p className="text-on-surface-variant leading-relaxed">
            Fundada com a premissa de resolver a complexidade da gestão de resíduos de grandes geradores, a DDN construiu uma infraestrutura sólida. Com bases operacionais estrategicamente localizadas e parceiros de tratamento homologados, garantimos que nenhum resíduo se torne um passivo para sua empresa.
          </p>
          <p className="text-on-surface-variant leading-relaxed">
            Acreditamos que a inovação tecnológica (como a emissão automatizada de MTRs) atrelada à operação rigorosa é a chave para uma governança ESG (Environmental, Social, and Governance) verdadeira.
          </p>
        </div>
        <div className="relative h-96 rounded-3xl overflow-hidden shadow-soft border border-surface-variant">
          <div className="absolute inset-0 bg-surface-bright flex items-center justify-center">
             <span className="text-surface-variant font-mono">Espaço para Imagem Institucional</span>
          </div>
        </div>
      </section>

    </div>
  )
}
