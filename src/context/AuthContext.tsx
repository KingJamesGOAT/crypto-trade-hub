import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchApiKeys: () => Promise<ApiKeys | null>;
}

interface ApiKeys {
  geminiApiKey: string;
  binanceApiKey: string;
  binanceSecretKey: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUsername = localStorage.getItem('auth_username');
    
    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUsername(savedUsername);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Try backend API first
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setUsername(data.username);
        setIsAuthenticated(true);
        
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_username', data.username);
        
        return true;
      }
      
      // Fallback for local development (when Vercel API not available)
      if (response.status === 404 || !response.ok) {
        console.log('[Auth] API not available, using local fallback');
        
        // Check credentials locally
        if (username.toLowerCase() === 'blackswan' && password === 'Bl@ckSw4n_St3vE!92#Xq') {
          const mockToken = 'dev-token-' + Date.now();
          setToken(mockToken);
          setUsername('blackswan');
          setIsAuthenticated(true);
          
          localStorage.setItem('auth_token', mockToken);
          localStorage.setItem('auth_username', 'blackswan');
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      
      // If fetch fails completely (e.g., network error), use local fallback
      console.log('[Auth] Network error, using local fallback');
      if (username.toLowerCase() === 'blackswan' && password === 'Bl@ckSw4n_St3vE!92#Xq') {
        const mockToken = 'dev-token-' + Date.now();
        setToken(mockToken);
        setUsername('blackswan');
        setIsAuthenticated(true);
        
        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('auth_username', 'blackswan');
        
        return true;
      }
      
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    setIsAuthenticated(false);
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_username');
  };

  const fetchApiKeys = async (): Promise<ApiKeys | null> => {
    if (!token) return null;

    try {
      const response = await fetch('/api/keys/get', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Fetch keys error:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, token, login, logout, fetchApiKeys }}>
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
