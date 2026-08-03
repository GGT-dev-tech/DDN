export function PrivacyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-8 py-16 space-y-8">
      <h1 className="text-3xl md:text-5xl font-bold text-on-surface mb-8">Política de Privacidade</h1>
      
      <div className="bg-surface-white/80 backdrop-blur-md border border-surface-variant p-8 md:p-12 rounded-3xl shadow-sm text-on-surface-variant leading-relaxed space-y-6">
        <p>
          <em>Última atualização: {new Date().toLocaleDateString('pt-BR')}</em>
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">1. Introdução</h2>
          <p>
            A DDN Destinação de Resíduos tem o compromisso de proteger a privacidade e a segurança das informações de seus clientes e parceiros (Titulares dos Dados). Esta Política de Privacidade foi elaborada em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">2. Coleta de Dados Pessoais</h2>
          <p>
            Coletamos apenas as informações estritamente necessárias para a prestação de nossos serviços de gestão ambiental. Isso inclui:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Dados cadastrais (Nome, CPF/CNPJ, E-mail, Telefone, Endereço).</li>
            <li>Informações técnicas relativas aos geradores de resíduos.</li>
            <li>Informações de acesso à nossa plataforma (Login e logs).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">3. Uso das Informações</h2>
          <p>
            As informações coletadas são utilizadas exclusivamente para:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Emissão de documentação ambiental obrigatória (MTR, CDF).</li>
            <li>Comunicação sobre o andamento das coletas e orçamentos.</li>
            <li>Acesso ao sistema para controle gerencial.</li>
            <li>Atendimento de exigências legais perante órgãos fiscalizadores (IBAMA, IMA, ANVISA).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">4. Compartilhamento de Dados</h2>
          <p>
            A DDN não comercializa dados pessoais. O compartilhamento ocorre apenas quando exigido por obrigações legais (como o envio de dados ao SINIR) ou com fornecedores estritamente essenciais para a operação tecnológica (hospedagem em nuvem), sempre sob contratos rígidos de confidencialidade.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">5. Direitos do Titular</h2>
          <p>
            Em cumprimento à LGPD, o titular dos dados tem o direito de solicitar a confirmação da existência de tratamento, o acesso aos dados, correção de dados incompletos ou desatualizados, e a revogação do consentimento (quando aplicável).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">6. Contato (DPO)</h2>
          <p>
            Para esclarecer quaisquer dúvidas sobre nossa política ou para exercer seus direitos, entre em contato pelo e-mail: <strong>privacidade@ddn.ind.br</strong>
          </p>
        </section>
      </div>
    </div>
  )
}
