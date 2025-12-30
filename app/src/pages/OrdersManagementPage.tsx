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

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'accepte', label: 'Acceptée' },
  { value: 'en_preparation', label: 'En préparation' },
  { value: 'en_cours_de_livraison', label: 'En cours de livraison' },
  { value: 'livre', label: 'Livrée' },
  { value: 'en_attente_retour_materiel', label: 'En attente de retour de matériel' },
  { value: 'terminee', label: 'Terminée' },
  { value: 'annulee', label: 'Annulée' },
];

export function OrdersManagementPage() {
  const { currentUser, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: '', userId: '' });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetchOrders();
  }, [token, filters]);

  async function fetchOrders() {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.userId) params.append('userId', filters.userId);

      const response = await fetch(`${API_BASE}/api/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Impossible de charger les commandes.');
      }

      const data = await response.json();
      setOrders(data.data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus || !token) return;

    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE}/api/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          comment: comment || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour.');
      }

      setSelectedOrder(null);
      setNewStatus('');
      setComment('');
      fetchOrders();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  if (!currentUser || !['administrateur', 'employe'].includes(currentUser.role)) {
    return (
      <div className="orders-management__unauthorized">
        <h1>Accès refusé</h1>
        <p>Cette page est réservée aux employés et administrateurs.</p>
        <NavLink to="/" className="app-button">
          Retour à l'accueil
        </NavLink>
      </div>
    );
  }

  return (
    <div className="orders-management">
      <header className="orders-management__header">
        <h1>Gestion des commandes</h1>
      </header>

      <section className="orders-management__filters">
        <h2>Filtres</h2>
        <div className="filters-grid">
          <div className="form-group">
            <label htmlFor="filter-status">Statut</label>
            <select
              id="filter-status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="filter-user">ID Utilisateur (optionnel)</label>
            <input
              id="filter-user"
              type="text"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              placeholder="Filtrer par utilisateur"
            />
          </div>
        </div>
      </section>

      {loading && <p>Chargement des commandes...</p>}
      {error && <p className="form-feedback">{error}</p>}

      <section className="orders-management__list">
        <h2>Liste des commandes ({orders.length})</h2>
        {orders.length === 0 ? (
          <p>Aucune commande trouvée.</p>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Menu</th>
                  <th>Client</th>
                  <th>Date événement</th>
                  <th>Convives</th>
                  <th>Statut</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id.slice(0, 8)}</td>
                    <td>{order.menuTitle}</td>
                    <td>{order.userId.slice(0, 8)}</td>
                    <td>{new Date(order.eventDate).toLocaleDateString('fr-FR')}</td>
                    <td>{order.guests}</td>
                    <td>
                      <span className={`status-badge status-badge--${order.status}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td>
                      {order.totalPrice
                        ? order.totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                        : 'N/A'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="app-button app-button--ghost app-button--small"
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                        }}
                      >
                        Modifier statut
                      </button>
                      <NavLink
                        to={`/mes-commandes/${order.id}`}
                        className="app-button app-button--ghost app-button--small"
                      >
                        Voir détail
                      </NavLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Modifier le statut de la commande #{selectedOrder.id.slice(0, 8)}</h2>
            <div className="form-group">
              <label htmlFor="new-status">Nouveau statut</label>
              <select
                id="new-status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {statusOptions.slice(1).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status-comment">Commentaire (optionnel)</label>
              <textarea
                id="status-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Commentaire sur le changement de statut..."
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="app-button app-button--ghost"
                onClick={() => {
                  setSelectedOrder(null);
                  setNewStatus('');
                  setComment('');
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                className="app-button"
                onClick={handleStatusUpdate}
                disabled={updating || !newStatus}
              >
                {updating ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

