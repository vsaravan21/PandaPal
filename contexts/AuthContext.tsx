import React, { createContext, useContext, useState, useCallback } from 'react';

type AuthContextType = {
  hasPanda: boolean;
  setHasPanda: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasPanda, setHasPandaState] = useState(false);
  const setHasPanda = useCallback((value: boolean) => setHasPandaState(value), []);
  return (
    <AuthContext.Provider value={{ hasPanda, setHasPanda }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
