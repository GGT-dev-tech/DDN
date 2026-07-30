"use client";

import { useEffect, useState } from "react";
import { Search, Route, Truck, X } from "lucide-react";
import { useWorkspaceStore } from "../../../entities/workspace/model/store";

export function CommandPalette() {
  const { isCommandPaletteOpen: isOpen, setCommandPaletteOpen: onClose } = useWorkspaceStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose(!isOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 sm:pt-48 bg-zinc-950/20 backdrop-blur-sm">
      {/* Click outside to close */}
      <div 
        className="absolute inset-0" 
        onClick={() => onClose(false)} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-2xl bg-glass border border-white/20 dark:border-white/10 shadow-2xl rounded-xl overflow-hidden mx-4 transform transition-all">
        <div className="flex flex-col h-[400px]">
          <div className="flex items-center border-b border-zinc-200/50 dark:border-zinc-800/50 px-4 py-3">
            <Search size={20} className="text-zinc-500 mr-3" />
            <input
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={() => onClose(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
            <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Quick Actions
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-brand-cyan hover:text-white transition-colors text-zinc-700 dark:text-zinc-300 text-sm group">
              <Route size={18} className="group-hover:text-white" />
              <span>Create Route</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-brand-cyan hover:text-white transition-colors text-zinc-700 dark:text-zinc-300 text-sm group">
              <Truck size={18} className="group-hover:text-white" />
              <span>Assign Vehicle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
