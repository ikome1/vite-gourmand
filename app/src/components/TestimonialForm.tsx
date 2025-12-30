import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface TestimonialFormProps {
  orderId: string;
  orderMenuTitle: string;
  onSuccess?: () => void;
}

export function TestimonialForm({ orderId, orderMenuTitle, onSuccess }: TestimonialFormProps) {
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [event, setEvent] = useState('');
  const [quote, setQuote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Vous devez être connecté pour donner un avis.');
      return;
    }

    if (!quote.trim() || quote.length < 10) {
      setError('Votre commentaire doit contenir au moins 10 caractères.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/testimonials`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          rating,
          event: event.trim() || orderMenuTitle,
          quote: quote.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'envoi de l\'avis.');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/mon-espace');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="testimonial-form" onSubmit={handleSubmit}>
      <h2>Donner votre avis</h2>
      <p>Votre commande "{orderMenuTitle}" est terminée. Partagez votre expérience !</p>

      <div className="form-group">
        <label htmlFor="testimonial-rating">Note (1 à 5 étoiles)</label>
        <div className="rating-input">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={`rating-star ${rating >= value ? 'rating-star--active' : ''}`}
              onClick={() => setRating(value)}
              aria-label={`${value} étoile${value > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
          <input
            id="testimonial-rating"
            type="hidden"
            value={rating}
            required
            min={1}
            max={5}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="testimonial-event">Type d'événement (optionnel)</label>
        <input
          id="testimonial-event"
          type="text"
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          placeholder={orderMenuTitle}
        />
      </div>

      <div className="form-group">
        <label htmlFor="testimonial-quote">Votre avis *</label>
        <textarea
          id="testimonial-quote"
          rows={6}
          required
          minLength={10}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Partagez votre expérience avec nous..."
        />
        <small>Minimum 10 caractères. Votre avis sera soumis à validation par notre équipe.</small>
      </div>

      {error && <p className="form-feedback">{error}</p>}

      <div className="testimonial-form__actions">
        <button type="submit" className="app-button app-button--large" disabled={submitting}>
          {submitting ? 'Envoi...' : 'Envoyer mon avis'}
        </button>
      </div>
    </form>
  );
}

