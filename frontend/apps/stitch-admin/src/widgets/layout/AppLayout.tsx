import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background-secondary overflow-hidden text-text-primary">
      <Sidebar className="flex-shrink-0" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 relative">
          <Outlet />
        </main>
      </div>

      {/* Watermark */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] opacity-80">
          <img src="/ddn-logo.png" alt="DDN Watermark" className="h-5 grayscale contrast-125" />
        </div>
      </div>
    </div>
  )
}
