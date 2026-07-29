"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@repo/ui/src/components/ui/button";
import { AppBreadcrumbs } from "./breadcrumbs";
import { UserMenu } from "./user-menu";
import { Suspense } from "react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/" },
    { name: "Empresas", href: "/companies" },
    { name: "Contratos", href: "/contracts" },
    { name: "Service Plans", href: "/service-plans" },
    { name: "Publicação", href: "/publishing" },
    { name: "Routing", href: "/routing" },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r bg-white">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="text-xl font-bold tracking-tight">GoAuct OS</span>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-zinc-100 text-zinc-900" 
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-start text-zinc-600">
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-16 flex items-center justify-between px-6 border-b bg-white">
          <div className="flex-1 overflow-hidden pr-4">
            <Suspense fallback={<div className="h-4 w-32 bg-zinc-100 rounded animate-pulse" />}>
              <AppBreadcrumbs />
            </Suspense>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
