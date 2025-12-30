import { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TestimonialForm } from '../components/TestimonialForm';
import type { Order } from '../types/order';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function TestimonialPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { currentUser, token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !orderId) {
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Commande introuvable.');
        }

        const data = await response.json();
        setOrder(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, token]);

  if (!currentUser) {
    return (
      <div className="testimonial-page__unauthorized">
        <h1>Connexion requise</h1>
        <NavLink to="/connexion" className="app-button">
          Se connecter
        </NavLink>
      </div>
    );
  }

  if (loading) {
    return <div className="testimonial-page__loading">Chargement...</div>;
  }

  if (!order) {
    return (
      <div className="testimonial-page__error">
        <h1>Commande introuvable</h1>
        <NavLink to="/mon-espace" className="app-button">
          Retour à mon espace
        </NavLink>
      </div>
    );
  }

  if (order.status !== 'terminee') {
    return (
      <div className="testimonial-page__error">
        <h1>Impossible de donner un avis</h1>
        <p>Vous ne pouvez donner un avis que pour une commande terminée.</p>
        <NavLink to={`/mes-commandes/${order.id}`} className="app-button">
          Voir la commande
        </NavLink>
      </div>
    );
  }

  return (
    <div className="testimonial-page">
      <NavLink to={`/mes-commandes/${order.id}`} className="back-button">
        ← Retour à la commande
      </NavLink>
      <TestimonialForm orderId={order.id} orderMenuTitle={order.menuTitle} />
    </div>
  );
}

