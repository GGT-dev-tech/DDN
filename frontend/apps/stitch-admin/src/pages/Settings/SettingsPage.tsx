import { Button } from '../../shared/ui/components/Button';
import { Input } from '../../shared/ui/components/Input';
import { Settings, Building2, Mail, Save } from 'lucide-react';

export function SettingsPage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement settings mutation
    alert('Configurações salvas!');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-500">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Configurações</h1>
            <p className="text-sm text-text-secondary mt-1">
              Atualize as configurações e informações do seu ambiente.
            </p>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-xl border border-border max-w-2xl">
          <div className="flex items-center gap-2 text-text-primary font-semibold border-b border-border/50 pb-4 mb-6">
            <Building2 size={18} className="text-brand-500" />
            Configuração da Organização
          </div>
          
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Nome da Empresa
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input 
                  id="companyName" 
                  defaultValue="DDN Management" 
                  className="pl-9 h-11"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="supportEmail" className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Email de Suporte
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input 
                  id="supportEmail" 
                  type="email" 
                  defaultValue="support@ddn-management.local" 
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Button type="submit" variant="liquid" className="gap-2">
                <Save size={16} /> Salvar Alterações
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
