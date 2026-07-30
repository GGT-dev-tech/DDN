"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Route, Truck, Users, Settings, FileText, Library, Building2, CircleDollarSign, CalendarDays, ListChecks, Map, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useWorkspaceStore } from "../../../entities/workspace/model/store";
import { Button } from "@repo/ui/src/components/ui/button";

const GROUPED_NAVIGATION = [
  {
    category: "Geral",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    ],
  },
  {
    category: "CRM",
    items: [
      { name: "Leads", icon: Users, href: "/crm/leads" },
      { name: "Clientes", icon: Building2, href: "/crm/customers" },
    ],
  },
  {
    category: "Comercial",
    items: [
      { name: "Catálogo", icon: Library, href: "/catalog" },
      { name: "Tabelas de Preço", icon: CircleDollarSign, href: "/pricing" },
      { name: "Cotações", icon: FileText, href: "/quotations" },
    ],
  },
  {
    category: "Operação",
    items: [
      { name: "Planos de Serviço", icon: CalendarDays, href: "/service-plans" },
      { name: "Requisitos", icon: ListChecks, href: "/requirements" },
      { name: "Planejador", icon: Map, href: "/planner" },
      { name: "Rotas", icon: Route, href: "/routes" },
      { name: "Frota", icon: Truck, href: "/fleet" },
      { name: "Motoristas", icon: Users, href: "/drivers" },
    ],
  },
  {
    category: "Administração",
    items: [
      { name: "Configurações", icon: Settings, href: "/settings" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarMinimized, toggleSidebar } = useWorkspaceStore();

  return (
    <aside
      className={`flex flex-col border-r bg-white dark:bg-zinc-950 transition-all duration-300 ease-in-out ${
        isSidebarMinimized ? "w-20" : "w-64"
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b">
        <div className={`flex items-center overflow-hidden transition-all duration-300 ${isSidebarMinimized ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
          <span className="text-xl font-bold tracking-tight text-brand-cyan dark:text-brand-green whitespace-nowrap">
            DDN OS
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0" title={isSidebarMinimized ? "Expandir" : "Minimizar"}>
          {isSidebarMinimized ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-6 overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        {GROUPED_NAVIGATION.map((group) => (
          <div key={group.category} className="space-y-1">
            <h3 
              className={`text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 transition-all duration-300 ${
                isSidebarMinimized ? "text-center px-0 text-[10px]" : "px-4"
              }`}
            >
              {isSidebarMinimized ? group.category.substring(0, 3) : group.category}
            </h3>
            <div className="px-2 space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={isSidebarMinimized ? item.name : undefined}
                    className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
                      isSidebarMinimized ? "justify-center p-2" : "px-3 py-2"
                    } ${
                      isActive
                        ? "bg-brand-cyan/10 text-brand-cyan dark:bg-brand-green/10 dark:text-brand-green"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <item.icon size={20} className="shrink-0" />
                    {!isSidebarMinimized && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className={`flex items-center ${isSidebarMinimized ? "justify-center" : "gap-3"}`}>
          <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-cyan font-bold shrink-0">
            G
          </div>
          {!isSidebarMinimized && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">Gustavo</span>
              <span className="text-xs text-zinc-500 truncate">Admin</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
