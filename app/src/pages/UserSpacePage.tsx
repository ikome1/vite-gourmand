import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../types/order';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const statusLabels: Record<string, string> = {
  en_attente: 'En attente',
  accepte: 'Acceptée',
  en_preparation: 'En préparation',
  en_cours_de_livraison: 'En cours de livraison',
  livre: 'Livrée',
  en_attente_retour_materiel: 'En attente de retour de matériel',
  terminee: 'Terminée',
  annulee: 'Annulée',
};

export function UserSpacePage() {
  const { currentUser, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function fetchOrders() {
      try {
        const response = await fetch(`${API_BASE}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Impossible de charger vos commandes.');
        }

        const data = await response.json();
        setOrders(data.data || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [token]);

  if (!currentUser) {
    return (
      <div className="user-space__unauthorized">
        <h1>Connexion requise</h1>
        <p>Vous devez être connecté pour accéder à votre espace.</p>
        <NavLink to="/connexion" className="app-button">
          Se connecter
        </NavLink>
      </div>
    );
  }

  return (
    <div className="user-space">
      <header className="user-space__header">
        <h1>Mon espace</h1>
        <p>
          Bienvenue {currentUser.firstName} {currentUser.lastName}
        </p>
      </header>

      <section className="user-space__section">
        <h2>Mes informations</h2>
        <div className="user-space__profile">
          <div className="profile-item">
            <strong>Nom :</strong> {currentUser.firstName} {currentUser.lastName}
          </div>
          <div className="profile-item">
            <strong>Email :</strong> {currentUser.email}
          </div>
          <div className="profile-item">
            <strong>Téléphone :</strong> {currentUser.phone}
          </div>
          <div className="profile-item">
            <strong>Adresse :</strong> {currentUser.address}
          </div>
          <NavLink to="/mon-compte/modifier" className="app-button app-button--ghost">
            Modifier mes informations
          </NavLink>
        </div>
      </section>

      <section className="user-space__section">
        <h2>Mes commandes</h2>
        {loading && <p>Chargement de vos commandes…</p>}
        {error && <p className="form-feedback">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p>Vous n'avez pas encore passé de commande.</p>
        )}
        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
}

function OrderCard({ order }: OrderCardProps) {
  return (
    <article className="order-card">
      <div className="order-card__header">
        <div>
          <h3>{order.menuTitle}</h3>
          <p className="order-card__date">Commandé le {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>
        <span className={`order-card__status order-card__status--${order.status}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>
      <div className="order-card__details">
        <div className="order-card__detail">
          <strong>Date de l'événement :</strong> {new Date(order.eventDate).toLocaleDateString('fr-FR')}
        </div>
        <div className="order-card__detail">
          <strong>Nombre de convives :</strong> {order.guests}
        </div>
        {order.totalPrice && (
          <div className="order-card__detail">
            <strong>Total :</strong>{' '}
            {order.totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
        )}
      </div>
      <div className="order-card__actions">
        <NavLink to={`/mes-commandes/${order.id}`} className="app-button app-button--ghost">
          Voir le détail
        </NavLink>
        {order.status === 'en_attente' && (
          <button className="app-button app-button--secondary">Annuler</button>
        )}
        {order.status === 'terminee' && (
          <NavLink to={`/mes-commandes/${order.id}/avis`} className="app-button app-button--ghost">
            Donner mon avis
          </NavLink>
        )}
      </div>
    </article>
  );
}

