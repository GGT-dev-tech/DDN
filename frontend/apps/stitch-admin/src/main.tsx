import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from './shared/ui/components/Button'
import { Card } from './shared/ui/components/Card'
import './app/styles/global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// MSW Setup for Dev
async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return
  }
  const { worker } = await import('./shared/api/mock/browser')
  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}

function App() {
  return (
    <div className="min-h-screen bg-background-secondary p-8 flex flex-col items-center justify-center gap-8">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-text-primary">
          DDN Management
        </h1>
        <p className="text-lg text-text-secondary">
          Sistema Logístico e Roteirização Inteligente
        </p>
      </div>

      <Card className="max-w-md w-full text-center space-y-6">
        <h2 className="text-xl font-semibold">Protótipo Inicial</h2>
        <p className="text-text-secondary text-sm">
          UI Kit, Design Tokens e Mock (MSW) estabelecidos. FSD Architecture pronta.
        </p>
        <Button variant="liquid" className="w-full py-3">
          Acessar Dashboard
        </Button>
      </Card>
    </div>
  )
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
})
