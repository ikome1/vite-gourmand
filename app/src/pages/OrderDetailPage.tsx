import { useEffect, useState } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Order, OrderHistoryEntry } from '../types/order';

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

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<OrderHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    guests: 0,
    eventDate: '',
    deliveryAddress: '',
    notes: '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!token || !orderId) {
      setLoading(false);
      return;
    }

    async function fetchOrderDetails() {
      try {
        const [orderRes, historyRes] = await Promise.all([
          fetch(`${API_BASE}/api/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/orders/${orderId}/history`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!orderRes.ok) {
          throw new Error('Commande introuvable.');
        }

        const orderData = await orderRes.json();
        const historyData = await historyRes.json();

        setOrder(orderData.data);
        setHistory(historyData.data || []);
        
        // Initialiser le formulaire d'édition
        if (orderData.data) {
          setEditForm({
            guests: orderData.data.guests,
            eventDate: orderData.data.eventDate,
            deliveryAddress: orderData.data.deliveryAddress,
            notes: orderData.data.notes || '',
          });
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [orderId, token]);

  const handleCancel = async () => {
    if (!token || !order || !confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }

    if (order.status !== 'en_attente') {
      alert('Cette commande ne peut plus être annulée.');
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch(`${API_BASE}/api/orders/${order.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'Annulée par l\'utilisateur' }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation.');
      }

      navigate('/mon-espace');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setCancelling(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    // Restaurer les valeurs originales
    if (order) {
      setEditForm({
        guests: order.guests,
        eventDate: order.eventDate,
        deliveryAddress: order.deliveryAddress,
        notes: order.notes || '',
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !order) return;

    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE}/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la mise à jour.');
      }

      const data = await response.json();
      setOrder(data.data);
      setEditing(false);
      
      // Recharger l'historique
      const historyRes = await fetch(`${API_BASE}/api/orders/${order.id}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const historyData = await historyRes.json();
      setHistory(historyData.data || []);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="order-detail__loading">Chargement...</div>;
  }

  if (!currentUser) {
    return (
      <div className="order-detail__unauthorized">
        <h1>Connexion requise</h1>
        <NavLink to="/connexion" className="app-button">
          Se connecter
        </NavLink>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-detail__error">
        <h1>Commande introuvable</h1>
        <p>{error || 'Cette commande n\'existe pas ou vous n\'y avez pas accès.'}</p>
        <NavLink to="/mon-espace" className="app-button">
          Retour à mon espace
        </NavLink>
      </div>
    );
  }

  return (
    <div className="order-detail">
      <header className="order-detail__header">
        <NavLink to="/mon-espace" className="back-button">
          ← Retour à mes commandes
        </NavLink>
        <h1>Commande #{order.id.slice(0, 8)}</h1>
        <span className={`order-detail__status order-detail__status--${order.status}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </header>

      <div className="order-detail__content">
        <section className="order-detail__section">
          <div className="order-detail__section-header">
            <h2>Détails du menu</h2>
            {order.status === 'en_attente' && !editing && (
              <button type="button" className="app-button app-button--ghost" onClick={handleEdit}>
                Modifier
              </button>
            )}
          </div>
          
          {!editing ? (
            <div className="order-detail__info">
              <div className="info-item">
                <strong>Menu :</strong> {order.menuTitle}
              </div>
              <div className="info-item">
                <strong>Nombre de convives :</strong> {order.guests}
              </div>
              <div className="info-item">
                <strong>Date de l'événement :</strong>{' '}
                {new Date(order.eventDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="info-item">
                <strong>Adresse de livraison :</strong> {order.deliveryAddress}
              </div>
              {order.notes && (
                <div className="info-item">
                  <strong>Notes :</strong> {order.notes}
                </div>
              )}
            </div>
          ) : (
            <form className="order-detail__edit-form" onSubmit={handleUpdate}>
              <div className="form-group">
                <label htmlFor="edit-guests">Nombre de convives *</label>
                <input
                  id="edit-guests"
                  type="number"
                  min={1}
                  required
                  value={editForm.guests}
                  onChange={(e) => setEditForm({ ...editForm, guests: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-eventDate">Date de l'événement *</label>
                <input
                  id="edit-eventDate"
                  type="date"
                  required
                  value={editForm.eventDate}
                  onChange={(e) => setEditForm({ ...editForm, eventDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-deliveryAddress">Adresse de livraison *</label>
                <textarea
                  id="edit-deliveryAddress"
                  rows={3}
                  required
                  value={editForm.deliveryAddress}
                  onChange={(e) => setEditForm({ ...editForm, deliveryAddress: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-notes">Notes (optionnel)</label>
                <textarea
                  id="edit-notes"
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </div>
              <div className="order-detail__edit-actions">
                <button
                  type="button"
                  className="app-button app-button--ghost"
                  onClick={handleCancelEdit}
                  disabled={updating}
                >
                  Annuler
                </button>
                <button type="submit" className="app-button" disabled={updating}>
                  {updating ? 'Mise à jour...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          )}
        </section>

        {order.totalPrice && (
          <section className="order-detail__section">
            <h2>Récapitulatif du prix</h2>
            <div className="order-detail__price">
              {order.menuPrice && (
                <div className="price-line">
                  <span>Prix menu :</span>
                  <span>{order.menuPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
              )}
              {order.discountAmount && order.discountAmount > 0 && (
                <div className="price-line price-line--discount">
                  <span>Réduction :</span>
                  <span>
                    -{order.discountAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              )}
              {order.deliveryPrice !== undefined && (
                <div className="price-line">
                  <span>Livraison :</span>
                  <span>
                    {order.deliveryPrice === 0
                      ? 'Gratuite'
                      : order.deliveryPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              )}
              <div className="price-line price-line--total">
                <span>
                  <strong>Total :</strong>
                </span>
                <span>
                  <strong>
                    {order.totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </strong>
                </span>
              </div>
            </div>
          </section>
        )}

        <section className="order-detail__section">
          <h2>Historique</h2>
          {history.length === 0 ? (
            <p>Aucun historique disponible.</p>
          ) : (
            <div className="order-detail__history">
              {history.map((entry) => (
                <div key={entry.id} className="history-entry">
                  <div className="history-entry__header">
                    <span className={`history-entry__status history-entry__status--${entry.status}`}>
                      {statusLabels[entry.status] || entry.status}
                    </span>
                    <span className="history-entry__date">
                      {new Date(entry.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  {entry.comment && <p className="history-entry__comment">{entry.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="order-detail__actions">
          {order.status === 'en_attente' && (
            <button
              type="button"
              className="app-button app-button--secondary"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Annulation...' : 'Annuler la commande'}
            </button>
          )}
          {order.status === 'terminee' && (
            <NavLink to={`/mes-commandes/${order.id}/avis`} className="app-button">
              Donner mon avis
            </NavLink>
          )}
        </section>
      </div>
    </div>
  );
}

