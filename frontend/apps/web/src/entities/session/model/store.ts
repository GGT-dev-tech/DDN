import { create } from 'zustand';
import { AuthState, UserSession } from './types';

interface SessionStore extends AuthState {
  setSession: (user: UserSession) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setSession: (user) => set({ user, isAuthenticated: true }),
  clearSession: () => set({ user: null, isAuthenticated: false }),
}));
