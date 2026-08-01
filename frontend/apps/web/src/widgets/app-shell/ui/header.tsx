"use client";

import { Suspense } from "react";
import { Search, Bell } from "lucide-react";
import { useWorkspaceStore } from "../../../entities/workspace/model/store";
import { Button } from "@/components/ui/button";
import { AppBreadcrumbs } from "./breadcrumbs";
import { UserMenu } from "./user-menu";
import { CommandPalette } from "./command-palette";

export function Header() {
  const { setCommandPaletteOpen } = useWorkspaceStore();

  return (
    <>
      <header className="h-16 border-b bg-white dark:bg-zinc-950 flex items-center justify-between px-6 transition-colors">
        <div className="flex-1 overflow-hidden pr-4 flex items-center">
          <Suspense fallback={<div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />}>
            <AppBreadcrumbs />
          </Suspense>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <Button
            variant="ghost"
            className="hidden md:flex items-center gap-2 text-zinc-500 w-64 justify-start border bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => setCommandPaletteOpen(true)}
          >
            <Search size={16} />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="ml-auto text-[10px] font-medium opacity-50 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
          </Button>

          {/* Botão de busca mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-zinc-500"
            onClick={() => setCommandPaletteOpen(true)}
          >
            <Search size={20} />
          </Button>

          <Button variant="ghost" size="icon" className="text-zinc-500 rounded-full">
            <Bell size={20} />
          </Button>

          <UserMenu />
        </div>
      </header>

      <CommandPalette />
    </>
  );
}
