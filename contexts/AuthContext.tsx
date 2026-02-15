import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import * as roleStorage from '@/features/auth/storage/roleStorage';

type Role = 'kid' | 'caregiver' | null;

type AuthContextType = {
  hasPanda: boolean;
  setHasPanda: (value: boolean) => void;
  role: Role;
  setRole: (r: Role) => void;
  clearRole: () => void;
  loading: boolean;
  uid: string | null;
  email: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasPanda, setHasPandaState] = useState(false);
  const [role, setRoleState] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const setHasPanda = useCallback((value: boolean) => setHasPandaState(value), []);
  const uid = firebaseUser?.uid ?? null;
  const email = firebaseUser?.email ?? null;

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
      if (mounted) setRoleState(r);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ hasPanda, setHasPanda, role, setRole, clearRole, loading, uid, email }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
