/**
 * Auth + Role context - hasPanda (logged in), role (kid | caregiver)
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getAuthState, setAuthState } from '@/features/auth/storage/authStorage';
import { getRole, setRole as persistRole, clearRole as persistClearRole, type Role } from '@/features/auth/storage/roleStorage';

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const auth = await getAuthState();
      const r = await getRole();
      if (!cancelled) {
        setHasPandaState(auth.hasPanda);
        setRoleState(r);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const setHasPanda = useCallback(async (value: boolean) => {
    setHasPandaState(value);
    await setAuthState({ hasPanda: value });
    if (!value) {
      setRoleState(null);
      await persistClearRole();
    }
  }, []);

  const setRole = useCallback(async (r: Role) => {
    setRoleState(r);
    await persistRole(r);
  }, []);

  const clearRole = useCallback(async () => {
    setRoleState(null);
    await persistClearRole();
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
