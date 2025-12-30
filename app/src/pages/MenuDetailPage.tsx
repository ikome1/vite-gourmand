import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { MenuDetailContent } from '../components/MenuDetailContent';
import { useAuth } from '../context/AuthContext';
import type { Menu } from '../types/menu';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function MenuDetailPage() {
  const { menuId } = useParams<{ menuId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!menuId) {
      setError('Menu introuvable.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchMenu() {
      try {
        const response = await fetch(`${API_BASE}/api/menus/${menuId}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message ?? 'Menu introuvable.');
        }
        if (!cancelled) {
          setMenu({
            ...data.data,
            courses:
              data.data.courses ?? {
                entrees: [],
                plats: [],
                desserts: [],
              },
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message ?? 'Impossible de charger ce menu.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchMenu();
    return () => {
      cancelled = true;
    };
  }, [menuId]);

  if (loading) {
    return (
      <div className="menu-detail__not-found">
        <p>Chargement du menu…</p>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="menu-detail__not-found">
        <h1>Menu introuvable</h1>
        <p>{error ?? 'Le menu demandé est indisponible ou a été retiré.'}</p>
        <NavLink to="/menus" className="app-button">
          Retour aux menus
        </NavLink>
      </div>
    );
  }

  return (
    <>
      <button type="button" className="back-button" onClick={() => navigate(-1)}>
        ← Retour
      </button>
      <MenuDetailContent menu={menu} isAuthenticated={Boolean(currentUser)} />
    </>
  );
}

