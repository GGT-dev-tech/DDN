import { LoginForm } from "../../features/auth/ui/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl border shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            GoAuct OS
          </h1>
          <p className="text-zinc-500 text-sm">
            Enter your credentials to access the operational system
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}
