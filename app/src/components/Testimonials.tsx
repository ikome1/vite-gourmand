import { useEffect, useState } from 'react';

type Testimonial = {
  id: string;
  name: string;
  event: string;
  quote: string;
  rating: number;
};

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchTestimonials() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/testimonials`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message ?? 'Impossible de charger les avis clients.');
        }
        if (!cancelled) {
          setItems(data.data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message ?? 'Impossible de charger les avis clients.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTestimonials();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="testimonials" aria-labelledby="titre-temoignages">
      <div className="section-header">
        <p className="section-eyebrow">Ils nous font confiance</p>
        <h2 id="titre-temoignages">Avis clients vérifiés</h2>
        <p>
          Les témoignages ci-dessous sont validés et authentifiés. Vite & Gourmand se conforme aux
          obligations réglementaires en matière d’avis en ligne.
        </p>
      </div>

      {loading && (
        <div className="menus-page__empty">
          <p>Collecte des avis clients…</p>
        </div>
      )}

      {error && !loading && (
        <div className="menus-page__empty">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="testimonials__grid">
          {items.map((item) => (
            <article key={item.id} className="testimonial-card">
              <div className="testimonial-card__rating" aria-label={`${item.rating} étoiles sur 5`}>
                {Array.from({ length: item.rating }).map((_, index) => (
                  <span key={index} aria-hidden="true">
                    ★
                  </span>
                ))}
              </div>
              <p className="testimonial-card__quote">“{item.quote}”</p>
              <footer>
                <p className="testimonial-card__author">{item.name}</p>
                <p className="testimonial-card__event">{item.event}</p>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

