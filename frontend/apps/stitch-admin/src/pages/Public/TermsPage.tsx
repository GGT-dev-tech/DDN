export function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-8 py-16 space-y-8">
      <h1 className="text-3xl md:text-5xl font-bold text-on-surface mb-8">Termos de Serviço</h1>
      
      <div className="bg-surface-white/80 backdrop-blur-md border border-surface-variant p-8 md:p-12 rounded-3xl shadow-sm text-on-surface-variant leading-relaxed space-y-6">
        <p>
          <em>Última atualização: {new Date().toLocaleDateString('pt-BR')}</em>
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar a plataforma e utilizar os serviços da DDN Destinação de Resíduos, você ("Cliente") concorda em se vincular aos presentes Termos de Serviço. A recusa em aceitar estes termos impede a utilização de nossa plataforma digital e de nossos serviços atrelados.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">2. Escopo dos Serviços</h2>
          <p>
            A DDN fornece soluções tecnológicas e logísticas para o gerenciamento de resíduos (Industriais e de Saúde). Nossas obrigações incluem:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Execução de coletas pré-agendadas ou sob demanda.</li>
            <li>Destinação ambientalmente adequada (Tratamento, Incineração, Aterro, Logística Reversa).</li>
            <li>Emissão de MTRs (Manifesto de Transporte de Resíduos) e CDFs (Certificado de Destinação Final).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">3. Obrigações do Cliente</h2>
          <p>
            O Cliente declara ser o único responsável por:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Garantir a correta segregação e acondicionamento dos resíduos (conforme NBR 10004 e RDC 222).</li>
            <li>Informar precisamente a composição qualitativa e quantitativa da carga.</li>
            <li>Não misturar resíduos perigosos com não perigosos ou materiais não declarados.</li>
          </ul>
          <p>
            Qualquer irregularidade identificada exime a DDN da responsabilidade do transporte e pode acarretar multas ou o retorno da carga.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">4. Disponibilidade do Sistema</h2>
          <p>
            Nosso portal do cliente visa 99.9% de uptime. No entanto, interrupções por manutenções programadas ou fatores externos (instabilidade no SINIR) podem ocorrer.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">5. Propriedade Intelectual</h2>
          <p>
            O layout, design, software, marcas e identidade visual (ex: Sistema BULBOX®) presentes no site são de propriedade exclusiva da DDN.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">6. Foro</h2>
          <p>
            Quaisquer disputas decorrentes deste termo serão dirimidas no foro da comarca da sede da contratada.
          </p>
        </section>
      </div>
    </div>
  )
}
