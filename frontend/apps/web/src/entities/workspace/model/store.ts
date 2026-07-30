import { create } from 'zustand';

interface WorkspaceState {
  isSidebarMinimized: boolean;
  toggleSidebar: () => void;
  setSidebarMinimized: (minimized: boolean) => void;
  
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  isSidebarMinimized: false,
  toggleSidebar: () => set((state) => ({ isSidebarMinimized: !state.isSidebarMinimized })),
  setSidebarMinimized: (minimized) => set({ isSidebarMinimized: minimized }),

  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
}));
