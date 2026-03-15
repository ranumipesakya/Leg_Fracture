/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authLogin, authLogout, authMe, authRegister, updateMe } from './authApi';

export type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  dob?: string;
  lastLogin?: string | null;
  initials: string;
};

export type RegisterInput = Omit<UserProfile, 'initials'> & {
  password: string;
};

type LoginResult = { ok: true } | { ok: false; error: string };
type RegisterResult = { ok: true } | { ok: false; error: string };
type UpdateProfileResult = { ok: true } | { ok: false; error: string };
type RefreshResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<UserProfile, 'initials'>>) => Promise<UpdateProfileResult>;
  refresh: () => Promise<RefreshResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  const refresh = useCallback(async (): Promise<RefreshResult> => {
    setIsLoading(true);
    const res = await authMe();
    setIsLoading(false);
    if (!res.ok) return { ok: false, error: res.error };
    setUser(res.data);
    return { ok: true };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(() => {
    const register: AuthContextValue['register'] = async (input) => {
      const emailKey = input.email.trim().toLowerCase();
      const res = await authRegister({
        firstName: input.firstName,
        lastName: input.lastName,
        email: emailKey,
        phone: input.phone,
        gender: input.gender,
        dob: input.dob,
        password: input.password,
      });
      if (!res.ok) return { ok: false, error: res.error };
      setUser(res.data.user);
      return { ok: true };
    };

    const login: AuthContextValue['login'] = async (email, password) => {
      const emailKey = email.trim().toLowerCase();
      const res = await authLogin(emailKey, password);
      if (!res.ok) return { ok: false, error: res.error };
      setUser(res.data.user);
      return { ok: true };
    };

    const logout: AuthContextValue['logout'] = async () => {
      await authLogout();
      setUser(null);
    };

    const updateProfile: AuthContextValue['updateProfile'] = async (updates) => {
      const res = await updateMe(updates);
      if (!res.ok) return { ok: false, error: res.error };
      setUser(res.data.user);
      return { ok: true };
    };

    return { user, isAuthenticated, isLoading, register, login, logout, updateProfile, refresh };
  }, [isAuthenticated, isLoading, refresh, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider.');
  return ctx;
}
