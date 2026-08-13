import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken?: string, tenantId?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from local storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('stitch_access_token');
    if (storedToken) {
      setToken(storedToken);
      // If we have a token but no tenant_id saved yet, auto-fetch it
      const storedTenantId = localStorage.getItem('stitch_tenant_id');
      if (!storedTenantId) {
        fetch('/api/v1/tenant/current', {
          headers: { Authorization: `Bearer ${storedToken}` }
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.tenant?.id) {
              localStorage.setItem('stitch_tenant_id', data.tenant.id);
            }
          })
          .catch(() => { /* silent — backend fallback will handle it */ });
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, refreshToken?: string, tenantId?: string) => {
    setToken(newToken);
    localStorage.setItem('stitch_access_token', newToken);
    if (refreshToken) {
      localStorage.setItem('stitch_refresh_token', refreshToken);
    }
    if (tenantId) {
      localStorage.setItem('stitch_tenant_id', tenantId);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('stitch_access_token');
    localStorage.removeItem('stitch_refresh_token');
    localStorage.removeItem('stitch_tenant_id');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
