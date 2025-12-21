import React, { createContext, useContext, useState, useEffect } from 'react';
// We assume 'puter' is available globally via CDN as per your gemini-service.ts
declare const puter: any;

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Check Puter Session on Mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof puter !== 'undefined' && puter.auth.isSignedIn()) {
          const user = await puter.auth.getUser();
          setUsername(user.username);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.warn("Puter auth check failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // 2. Login via Puter Popup
  const login = async () => {
    try {
      if (typeof puter === 'undefined') {
        alert("Puter.js not loaded. Cannot sign in.");
        return;
      }
      // This triggers the Puter.com secure popup
      await puter.auth.signIn();
      const user = await puter.auth.getUser();
      setUsername(user.username);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = () => {
    puter.auth.signOut();
    setUsername(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout, isLoading }}>
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
