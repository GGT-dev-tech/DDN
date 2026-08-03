import { Outlet, useNavigate, Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { Button } from '../../shared/ui/components/Button'

export function PublicLayout() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface-white text-on-surface flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 px-8 py-4 flex items-center justify-between bg-surface-white/80 backdrop-blur-md shadow-sm border-b border-surface-variant transition-all">
        <Link to="/" className="flex items-center gap-2 text-brand-500 font-bold text-2xl tracking-tighter hover:opacity-90 transition-opacity">
          <Leaf className="w-8 h-8" />
          DDN Resíduos
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/sobre" className="text-sm font-medium text-on-surface-variant hover:text-brand-500 transition-colors">Sobre Nós</Link>
          <Link to="/servicos" className="text-sm font-medium text-on-surface-variant hover:text-brand-500 transition-colors">Serviços</Link>
          <Link to="/compliance" className="text-sm font-medium text-on-surface-variant hover:text-brand-500 transition-colors">Compliance</Link>
          <Button className="bg-brand-500 text-white hover:bg-waste-green shadow-soft" onClick={() => navigate('/login')}>
            Área do Cliente
          </Button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-20 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-surface-bright py-12 px-8 border-t border-surface-variant mt-auto">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-brand-500 font-bold text-xl mb-4">
              <Leaf className="w-6 h-6" />
              DDN Resíduos
            </Link>
            <p className="text-sm text-on-surface-variant">
              Soluções inteligentes, seguras e sustentáveis para gestão de resíduos industriais e de saúde.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-4">Institucional</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li><Link to="/sobre" className="hover:text-brand-500 transition-colors">Sobre a Empresa</Link></li>
              <li><Link to="/servicos" className="hover:text-brand-500 transition-colors">Nossos Serviços</Link></li>
              <li><Link to="/compliance" className="hover:text-brand-500 transition-colors">Compliance e Meio Ambiente</Link></li>
              <li><Link to="/trabalhe-conosco" className="hover:text-brand-500 transition-colors">Trabalhe Conosco</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li><Link to="/privacidade" className="hover:text-brand-500 transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/termos" className="hover:text-brand-500 transition-colors">Termos de Serviço</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li>Rua Guaraparim, 490, Galpão 2</li>
              <li>Tabuleiro - Camboriú</li>
              <li className="pt-2"><strong>Informações:</strong> (47) 3264-8532</li>
              <li><strong>WhatsApp:</strong> 47 9 9192 2438</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-surface-variant flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-on-surface-variant">
            &copy; {new Date().getFullYear()} DDN Destinação de Resíduos. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
