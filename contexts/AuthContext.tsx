import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as roleStorage from '@/features/auth/storage/roleStorage';

type Role = 'kid' | 'caregiver' | null;

type AuthContextType = {
  hasPanda: boolean;
  setHasPanda: (value: boolean) => void;
  role: Role;
  setRole: (r: Role) => void;
  clearRole: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasPanda, setHasPandaState] = useState(false);
  const [role, setRoleState] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const setHasPanda = useCallback((value: boolean) => setHasPandaState(value), []);

  const setRole = useCallback(async (r: Role) => {
    await roleStorage.setRole(r);
    setRoleState(r);
  }, []);

  const clearRole = useCallback(async () => {
    await roleStorage.clearRole();
    setRoleState(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    roleStorage.getRole().then((r) => {
      if (mounted) {
        setRoleState(r);
      }
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <AuthContext.Provider value={{ hasPanda, setHasPanda, role, setRole, clearRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
