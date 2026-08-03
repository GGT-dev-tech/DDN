import { ShieldCheck, FileCheck2, Scale, SearchCheck } from 'lucide-react'

export function CompliancePage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-8 py-16 space-y-20">
      
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
          Compliance e Segurança Ambiental
        </h1>
        <p className="text-lg text-on-surface-variant leading-relaxed">
          Garantimos que todas as atividades de gestão de resíduos sejam executadas de forma legal, segura, rastreável e auditável, mitigando riscos para sua empresa.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-12">
        <div className="bg-surface-white/60 backdrop-blur-md border border-surface-variant rounded-3xl p-8 hover:shadow-soft transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500">
              <Scale size={24} />
            </div>
            <h2 className="text-2xl font-bold text-on-surface">Legislação e Normas</h2>
          </div>
          <p className="text-on-surface-variant mb-6">
            Operamos em estrita conformidade com as diretrizes federais e estaduais:
          </p>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-brand-500 shrink-0"></div>
              <div>
                <strong className="text-on-surface">Política Nacional de Resíduos Sólidos (PNRS)</strong>
                <p className="text-sm text-on-surface-variant">Responsabilidade compartilhada e destinação ambientalmente adequada.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-brand-500 shrink-0"></div>
              <div>
                <strong className="text-on-surface">ABNT NBR 10004</strong>
                <p className="text-sm text-on-surface-variant">Classificação de resíduos (Classe I, IIA, IIB) para armazenamento e transporte.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-brand-500 shrink-0"></div>
              <div>
                <strong className="text-on-surface">RDC 222/2018 (ANVISA)</strong>
                <p className="text-sm text-on-surface-variant">Boas práticas para gerenciamento de Resíduos de Serviços de Saúde.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-surface-white/60 backdrop-blur-md border border-surface-variant rounded-3xl p-8 hover:shadow-soft transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-2xl font-bold text-on-surface">Órgãos Reguladores</h2>
          </div>
          <p className="text-on-surface-variant mb-6">
            Nossas bases e parceiros são totalmente licenciados e homologados:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-bright p-4 rounded-xl text-center border border-surface-variant">
              <strong className="text-lg text-on-surface block">IBAMA</strong>
              <span className="text-xs text-on-surface-variant">Licenciamento Federal</span>
            </div>
            <div className="bg-surface-bright p-4 rounded-xl text-center border border-surface-variant">
              <strong className="text-lg text-on-surface block">IMA</strong>
              <span className="text-xs text-on-surface-variant">Licenciamento Estadual</span>
            </div>
            <div className="bg-surface-bright p-4 rounded-xl text-center border border-surface-variant">
              <strong className="text-lg text-on-surface block">ANVISA</strong>
              <span className="text-xs text-on-surface-variant">Autorização Sanitária</span>
            </div>
            <div className="bg-surface-bright p-4 rounded-xl text-center border border-surface-variant">
              <strong className="text-lg text-on-surface block">SINIR</strong>
              <span className="text-xs text-on-surface-variant">Sistema de Informação</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-bright rounded-3xl p-8 border border-surface-variant">
        <h2 className="text-2xl font-bold text-on-surface mb-8 text-center">Rastreabilidade e Documentação</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex gap-4">
            <FileCheck2 className="w-8 h-8 text-brand-500 shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-on-surface mb-2">MTR & CDF</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Emitimos e integramos o <strong>Manifesto de Transporte de Resíduos (MTR)</strong> em sincronia com o SINIR, garantindo o rastreio da coleta até a entrega. Após a disposição final, geramos automaticamente o <strong>Certificado de Destinação Final (CDF)</strong>, comprovando a eficácia do tratamento.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <SearchCheck className="w-8 h-8 text-brand-500 shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Apoio a Auditorias (ESG)</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Nossos clientes têm acesso instantâneo a todos os documentos exigidos para aprovação em auditorias ambientais ISO 14001, além de relatórios de emissões evitadas para relatórios de Governança ESG.
              </p>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  )
}
