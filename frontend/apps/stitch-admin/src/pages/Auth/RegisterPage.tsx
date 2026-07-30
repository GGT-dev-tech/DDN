import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { useRegisterApiV1AuthRegisterPost } from '../../shared/api/generated/auth/auth';
import { Button } from '../../shared/ui/components/Button';
import { Input } from '../../shared/ui/components/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const { mutate: registerMutation, isPending } = useRegisterApiV1AuthRegisterPost({
    mutation: {
      onSuccess: (data) => {
        login(data.access_token, data.refresh_token);
        navigate('/admin');
      },
      onError: (error: any) => {
        setErrorMsg(error.response?.data?.detail || 'Erro ao realizar cadastro');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    registerMutation({
      data: {
        email,
        password,
        tenant_name: tenantName
      }
    });
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md relative">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-brand-500 rounded-xl blur opacity-30 animate-pulse"></div>
        
        <Card className="relative bg-zinc-950/80 backdrop-blur-xl border-zinc-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center tracking-tight">Criar Conta</CardTitle>
            <CardDescription className="text-center">
              Crie uma conta para sua empresa no Stitch
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                  {errorMsg}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="tenantName">Nome da Empresa</label>
                <Input 
                  id="tenantName" 
                  type="text" 
                  placeholder="Minha Empresa de Resíduos"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  required
                  className="bg-zinc-900/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="email">Email do Administrador</label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-zinc-900/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="password">Senha</label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-zinc-900/50"
                />
              </div>
            </CardContent>
            <div className="flex flex-col gap-4 p-6 pt-0">
              <Button 
                type="submit" 
                className="w-full font-semibold"
                disabled={isPending}
              >
                {isPending ? 'Criando Conta...' : 'Criar Conta'}
              </Button>
              <div className="text-center text-sm text-zinc-400">
                Já tem uma conta? <Link to="/login" className="text-brand-500 hover:underline">Fazer Login</Link>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
