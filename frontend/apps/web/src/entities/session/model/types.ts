export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
}

export interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
}
