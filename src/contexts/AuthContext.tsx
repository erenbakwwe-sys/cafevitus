import React, { createContext, useContext, useState, useCallback } from 'react';

const DEFAULT_PIN = '1234';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('cv-admin-auth') === 'true';
  });

  const login = useCallback((pin: string): boolean => {
    // Check against stored PIN or default
    const storedPin = localStorage.getItem('cv-admin-pin') || DEFAULT_PIN;
    if (pin === storedPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('cv-admin-auth', 'true');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('cv-admin-auth');
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
