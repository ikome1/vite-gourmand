import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { User, UserRole } from '../types/user';
import { loadFromStorage, removeFromStorage, saveToStorage, storageKeys } from '../utils/storage';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface AuthContextValue {
  currentUser?: User;
  token?: string;
  status: 'idle' | 'loading';
  error?: string;
  initialized: boolean;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message: string }>;
  login: (payload: LoginPayload) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [token, setToken] = useState<string | undefined>(() => {
    const stored = loadFromStorage<string | null>(storageKeys.authToken, null);
    return stored ?? undefined;
  });
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [error, setError] = useState<string | undefined>(undefined);
  const [initialized, setInitialized] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const removeAuthToken = useCallback(() => {
    setToken(undefined);
    removeFromStorage(storageKeys.authToken);
  }, []);

  useEffect(() => {
    if (!token) {
      setCurrentUser(undefined);
      setInitialized(true);
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    async function loadProfile() {
      try {
        setStatus('loading');
        setError(undefined);
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            removeAuthToken();
            setCurrentUser(undefined);
          } else {
            const data = await response.json().catch(() => ({}));
            setError(data.message ?? 'Impossible de récupérer votre session.');
          }
        } else {
          const data = await response.json();
          setCurrentUser(data.user as User);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Erreur réseau lors de la récupération de la session.');
        }
      } finally {
        setStatus('idle');
        setInitialized(true);
      }
    }

    loadProfile();

    return () => {
      controller.abort();
    };
  }, [token, removeAuthToken]);

  const persistAuthToken = useCallback((value: string | undefined) => {
    if (value) {
      setToken(value);
      saveToStorage(storageKeys.authToken, value);
    } else {
      removeAuthToken();
    }
  }, [removeAuthToken]);

  const register = useCallback<AuthContextValue['register']>(
    async (payload) => {
      setStatus('loading');
      setError(undefined);
      try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          return { success: false, message: data.message ?? 'Inscription impossible.' };
        }

        persistAuthToken(data.token);
        setCurrentUser(data.user as User);
        return { success: true, message: data.message ?? 'Inscription réussie.' };
      } catch (err) {
        setError('Erreur réseau lors de l’inscription.');
        return { success: false, message: 'Erreur réseau lors de l’inscription.' };
      } finally {
        setStatus('idle');
      }
    },
    [persistAuthToken],
  );

  const login = useCallback<AuthContextValue['login']>(
    async (payload) => {
      setStatus('loading');
      setError(undefined);
      try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          return { success: false, message: data.message ?? 'Identifiants invalides.' };
        }

        persistAuthToken(data.token);
        setCurrentUser(data.user as User);
        return { success: true, message: data.message ?? 'Connexion réussie.' };
      } catch (err) {
        setError('Erreur réseau lors de la connexion.');
        return { success: false, message: 'Erreur réseau lors de la connexion.' };
      } finally {
        setStatus('idle');
      }
    },
    [persistAuthToken],
  );

  const logout = useCallback(async () => {
    if (!token) {
      removeAuthToken();
      setCurrentUser(undefined);
      return;
    }

    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      // Ignorer les erreurs réseau sur la déconnexion
    } finally {
      removeAuthToken();
      setCurrentUser(undefined);
    }
  }, [token, removeAuthToken]);

  const resetPassword = useCallback<AuthContextValue['resetPassword']>(async (email) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { success: false, message: data.message ?? 'Adresse inconnue.' };
      }
      return { success: true, message: data.message ?? 'Un email vient de vous être envoyé.' };
    } catch (err) {
      return { success: false, message: 'Erreur réseau lors de la demande.' };
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      token,
      status,
      error,
      initialized,
      register,
      login,
      logout,
      resetPassword,
    }),
    [currentUser, token, status, error, initialized, register, login, logout, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur de AuthProvider');
  }
  return context;
}

export function useIsAuthorized(roles: UserRole[]) {
  const { currentUser } = useAuth();
  if (!currentUser) return false;
  return roles.includes(currentUser.role);
}

