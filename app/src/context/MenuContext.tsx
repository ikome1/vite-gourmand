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
import { useAuth } from '../context/AuthContext';
import type { Menu, MenuFilters, NewMenuInput } from '../types/menu';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface MenuContextValue {
  menus: Menu[];
  filters: MenuFilters;
  loading: boolean;
  error?: string;
  setFilters: (filters: Partial<MenuFilters>) => void;
  resetFilters: () => void;
  refresh: () => Promise<void>;
  createMenu: (payload: NewMenuInput) => Promise<{ success: boolean; message: string }>;
  updateMenuStock: (id: string, stock: number) => Promise<{ success: boolean; message: string }>;
}

const defaultFilters: MenuFilters = {
  theme: 'Tous',
  regime: 'Tous',
};

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [filters, setFiltersState] = useState<MenuFilters>(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const fetchMenus = useCallback(async (activeFilters: MenuFilters) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(undefined);

    try {
      const params = new URLSearchParams();
      if (activeFilters.theme && activeFilters.theme !== 'Tous') {
        params.set('theme', activeFilters.theme);
      }
      if (activeFilters.regime && activeFilters.regime !== 'Tous') {
        params.set('regime', activeFilters.regime);
      }
      if (typeof activeFilters.maxPrice === 'number') {
        params.set('maxPrice', String(activeFilters.maxPrice));
      }
      if (activeFilters.priceRange) {
        params.set('priceMin', String(activeFilters.priceRange[0]));
        params.set('priceMax', String(activeFilters.priceRange[1]));
      }
      if (typeof activeFilters.minimumGuests === 'number') {
        params.set('minGuests', String(activeFilters.minimumGuests));
      }
      if (activeFilters.search) {
        params.set('search', activeFilters.search.trim());
      }

      const queryString = params.toString();
      const response = await fetch(
        `${API_BASE}/api/menus${queryString ? `?${queryString}` : ''}`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? 'Impossible de charger les menus.');
      }

      const data = await response.json();
      const mapped: Menu[] = (data.data ?? []).map((menu: Menu) => ({
        ...menu,
        images: Array.isArray(menu.images) ? menu.images : [],
        courses: menu.courses ?? {
          entrees: [],
          plats: [],
          desserts: [],
        },
      }));

      if (!controller.signal.aborted) {
        setMenus(mapped);
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return;
      }
      setError((err as Error).message ?? 'Erreur lors du chargement des menus.');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchMenus(filters);
    return () => {
      abortRef.current?.abort();
    };
  }, [filters, fetchMenus]);

  const setFilters = useCallback((next: Partial<MenuFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...next,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  const refresh = useCallback(async () => {
    await fetchMenus(filters);
  }, [fetchMenus, filters]);

  const createMenuHandler = useCallback<MenuContextValue['createMenu']>(
    async (payload) => {
      if (!token) {
        return { success: false, message: 'Authentification requise pour créer un menu.' };
      }

      try {
        const response = await fetch(`${API_BASE}/api/menus`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          return { success: false, message: data.message ?? 'Impossible de créer le menu.' };
        }
        const menu = data.data as Menu;
        setMenus((prev) => [
          {
            ...menu,
            images: Array.isArray(menu.images) ? menu.images : [],
            courses: menu.courses ?? { entrees: [], plats: [], desserts: [] },
          },
          ...prev,
        ]);
        return { success: true, message: data.message ?? 'Menu créé.' };
      } catch (err) {
        return { success: false, message: 'Erreur réseau lors de la création du menu.' };
      }
    },
    [token],
  );

  const updateMenuStockHandler = useCallback<MenuContextValue['updateMenuStock']>(
    async (id, stock) => {
      if (!token) {
        return { success: false, message: 'Authentification requise pour modifier le stock.' };
      }
      try {
        const response = await fetch(`${API_BASE}/api/menus/${id}/stock`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stock }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          return { success: false, message: data.message ?? 'Impossible de mettre à jour le stock.' };
        }
        setMenus((prev) =>
          prev.map((menu) =>
            menu.id === id
              ? {
                  ...menu,
                  stock,
                }
              : menu,
          ),
        );
        return { success: true, message: data.message ?? 'Stock mis à jour.' };
      } catch (err) {
        return { success: false, message: 'Erreur réseau lors de la mise à jour du stock.' };
      }
    },
    [token],
  );

  const value = useMemo<MenuContextValue>(
    () => ({
      menus,
      filters,
      loading,
      error,
      setFilters,
      resetFilters,
      refresh,
      createMenu: createMenuHandler,
      updateMenuStock: updateMenuStockHandler,
    }),
    [menus, filters, loading, error, setFilters, resetFilters, refresh, createMenuHandler, updateMenuStockHandler],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenuContext doit être utilisé dans un MenuProvider');
  }
  return context;
}

