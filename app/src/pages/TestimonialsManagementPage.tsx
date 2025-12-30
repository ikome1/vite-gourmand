import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface Testimonial {
  id: string;
  name: string;
  event: string;
  quote: string;
  rating: number;
  orderId?: string;
  pendingValidation: boolean;
}

export function TestimonialsManagementPage() {
  const { currentUser, token } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetchPendingTestimonials();
  }, [token]);

  async function fetchPendingTestimonials() {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/testimonials/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Impossible de charger les avis.');
      }

      const data = await response.json();
      setTestimonials(data.data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const handleValidate = async (testimonialId: string, validated: boolean) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/testimonials/${testimonialId}/validate`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ validated }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la validation.');
      }

      fetchPendingTestimonials();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (!currentUser || !['administrateur', 'employe'].includes(currentUser.role)) {
    return (
      <div className="testimonials-management__unauthorized">
        <h1>Accès refusé</h1>
        <p>Cette page est réservée aux employés et administrateurs.</p>
        <NavLink to="/" className="app-button">
          Retour à l'accueil
        </NavLink>
      </div>
    );
  }

  return (
    <div className="testimonials-management">
      <header className="testimonials-management__header">
        <h1>Gestion des avis clients</h1>
        <NavLink to="/espace-pro" className="app-button app-button--ghost">
          ← Retour à l'espace pro
        </NavLink>
      </header>

      <section className="testimonials-management__section">
        <h2>Avis en attente de validation</h2>
        {loading && <p>Chargement des avis...</p>}
        {error && <p className="form-feedback">{error}</p>}
        {!loading && !error && testimonials.length === 0 && (
          <p>Aucun avis en attente de validation.</p>
        )}
        {!loading && !error && testimonials.length > 0 && (
          <div className="testimonials-list">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card testimonial-card--pending">
                <div className="testimonial-card__header">
                  <div>
                    <h3>{testimonial.name}</h3>
                    <p className="testimonial-card__event">{testimonial.event}</p>
                  </div>
                  <div className="testimonial-card__rating">
                    {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                  </div>
                </div>
                <p className="testimonial-card__quote">"{testimonial.quote}"</p>
                {testimonial.orderId && (
                  <p className="testimonial-card__order-id">
                    Commande : {testimonial.orderId.slice(0, 8)}
                  </p>
                )}
                <div className="testimonial-card__actions">
                  <button
                    type="button"
                    className="app-button app-button--secondary"
                    onClick={() => handleValidate(testimonial.id, false)}
                  >
                    Refuser
                  </button>
                  <button
                    type="button"
                    className="app-button"
                    onClick={() => handleValidate(testimonial.id, true)}
                  >
                    Valider
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

