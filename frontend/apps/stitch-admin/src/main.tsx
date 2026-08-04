import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppRouterProvider } from './app/providers/AppRouter'
import { Toaster } from './shared/ui/components/Toast'
import { CookieConsentBanner } from './shared/ui/components/CookieConsentBanner'
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
  if (import.meta.env.VITE_API_MODE !== 'mock') {
    return
  }
  const { worker } = await import('./shared/api/mock/browser')
  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppRouterProvider />
        <Toaster />
        <CookieConsentBanner />
      </QueryClientProvider>
    </StrictMode>,
  )
})
