import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedAuth = localStorage.getItem('cth_auth_session');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      setUsername('Admin');
    }
    setIsLoading(false);
  }, []);

  const login = async (password: string): Promise<boolean> => {
    // Simple password check
    if (password === '090402') {
      setIsAuthenticated(true);
      setUsername('Admin');
      localStorage.setItem('cth_auth_session', 'true');
      return true;
    } else {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('cth_auth_session');
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
