"use client";

import { Suspense } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-900 transition-colors">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-6 relative">
          <Suspense fallback={null}>
            {children}
          </Suspense>
          
          {/* O Drawer (Panel) System pode ser renderizado aqui num portal no futuro */}
        </div>
      </main>
    </div>
  );
}
