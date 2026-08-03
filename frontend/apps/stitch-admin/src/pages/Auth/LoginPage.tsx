import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { useLoginApiV1AuthLoginPost } from '../../shared/api/generated/auth/auth';
import { Button } from '../../shared/ui/components/Button';
import { Input } from '../../shared/ui/components/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { ArrowLeft } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('admin@stitch.com');
  const [password, setPassword] = useState('stitchadmin');
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const { mutate: loginMutation, isPending } = useLoginApiV1AuthLoginPost({
    mutation: {
      onSuccess: (data) => {
        login(data.access_token, data.refresh_token);
        navigate('/admin');
      },
      onError: (error: any) => {
        setErrorMsg(error.response?.data?.detail || 'Erro ao realizar login');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    loginMutation({
      data: {
        email,
        password
      }
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-surface-bright p-4 relative overflow-hidden font-sans">
      
      <div className="absolute top-8 left-8 z-10">
        <Link to="/" className="flex items-center text-sm font-medium text-on-surface-variant hover:text-brand-500 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao site
        </Link>
      </div>

      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e2e2_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>
      
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500 rounded-full blur-[120px] opacity-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-data-blue rounded-full blur-[120px] opacity-10 animate-pulse"></div>
      
      <div className="w-full max-w-md relative z-10">
        <Card className="relative bg-surface-white/70 backdrop-blur-xl border-surface-variant shadow-soft overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-waste-green"></div>

          <CardHeader className="space-y-3 pt-8 pb-4 flex flex-col items-center">
            <div className="flex items-center justify-center mb-2">
              <img src="/ddn-logo.png" alt="DDN Logo" className="h-12" />
            </div>
            <CardTitle className="text-2xl font-bold text-center tracking-tight text-on-surface">Acesso Restrito</CardTitle>
            <CardDescription className="text-center text-on-surface-variant px-4">
              Faça login com suas credenciais de administrador para acessar o painel de operações da DDN.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <span className="font-bold shrink-0">Erro:</span> {errorMsg}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface" htmlFor="email">E-mail Corporativo</label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@ddn.ind.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-surface-white border-surface-variant focus:border-brand-500 focus:ring-brand-500/20"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface" htmlFor="password">Senha</label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-surface-white border-surface-variant focus:border-brand-500 focus:ring-brand-500/20"
                />
              </div>
            </CardContent>
            
            <div className="flex flex-col gap-4 p-6 pt-4 pb-8">
              <Button 
                type="submit" 
                className="w-full font-semibold bg-brand-500 text-white hover:bg-waste-green h-12 shadow-md hover:shadow-lg transition-all"
                disabled={isPending}
              >
                {isPending ? 'Autenticando...' : 'Acessar Painel'}
              </Button>
              <div className="text-center text-xs text-on-surface-variant mt-2">
                Acesso exclusivo para colaboradores DDN.
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
