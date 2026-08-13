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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouterProvider />
      <Toaster />
      <CookieConsentBanner />
    </QueryClientProvider>
  </StrictMode>,
)
