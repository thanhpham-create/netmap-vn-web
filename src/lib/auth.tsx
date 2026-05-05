'use client';

// Auth state — stores user/device tokens in localStorage.
// Device token issued on first /devices/register. User token added after OTP verify.

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from './api';

export type JwtTokens = {
  deviceToken?: string;
  userToken?: string;
};

export type CurrentUser = {
  id: string;
  phone: string;
  role: string;
  displayName?: string;
};

type AuthContextValue = {
  tokens: JwtTokens;
  user: CurrentUser | null;
  isReady: boolean;
  setUserToken: (token: string, user: CurrentUser) => void;
  logout: () => void;
  ensureDeviceRegistered: () => Promise<string>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'netmap-vn:auth';
const DEVICE_UID_KEY = 'netmap-vn:device-uid';

function loadFromStorage(): { tokens: JwtTokens; user: CurrentUser | null } {
  if (typeof window === 'undefined') return { tokens: {}, user: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { tokens: {}, user: null };
    return JSON.parse(raw);
  } catch {
    return { tokens: {}, user: null };
  }
}

function saveToStorage(tokens: JwtTokens, user: CurrentUser | null) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ tokens, user }));
}

function getOrCreateDeviceUid(): string {
  if (typeof window === 'undefined') return '';
  let uid = localStorage.getItem(DEVICE_UID_KEY);
  if (!uid) {
    uid = `web-${crypto.randomUUID()}`;
    localStorage.setItem(DEVICE_UID_KEY, uid);
  }
  return uid;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<JwtTokens>({});
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loaded = loadFromStorage();
    setTokens(loaded.tokens);
    setUser(loaded.user);
    setIsReady(true);
  }, []);

  function setUserToken(token: string, u: CurrentUser) {
    const next: JwtTokens = { ...tokens, userToken: token };
    setTokens(next);
    setUser(u);
    saveToStorage(next, u);
  }

  function logout() {
    // Keep deviceToken — anonymous reporting still allowed
    const next: JwtTokens = { deviceToken: tokens.deviceToken };
    setTokens(next);
    setUser(null);
    saveToStorage(next, null);
  }

  async function ensureDeviceRegistered(): Promise<string> {
    if (tokens.deviceToken) return tokens.deviceToken;
    const uid = getOrCreateDeviceUid();
    const res = await api.registerDevice(
      { deviceUid: uid, platform: 'web' },
      tokens.userToken ? { userToken: tokens.userToken } : undefined,
    );
    const next: JwtTokens = { ...tokens, deviceToken: res.deviceToken };
    setTokens(next);
    saveToStorage(next, user);
    return res.deviceToken;
  }

  return (
    <AuthContext.Provider value={{ tokens, user, isReady, setUserToken, logout, ensureDeviceRegistered }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
