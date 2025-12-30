import { useState } from 'react';
import type { FormEvent } from 'react';

interface FormState {
  name: string;
  email: string;
  title: string;
  message: string;
  consent: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const initialState: FormState = {
  name: '',
  email: '',
  title: '',
  message: '',
  consent: false,
};

export function ContactPage() {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.consent) {
      setErrorMessage('Merci de consentir au traitement de vos données afin que nous puissions vous répondre.');
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          title: formState.title,
          message: formState.message,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message ?? 'Erreur lors de l\'envoi du message.');
      }

      setStatus('success');
      setFormState(initialState);
    } catch (err) {
      setStatus('error');
      setErrorMessage((err as Error).message ?? 'Erreur lors de l\'envoi du message.');
    }
  };

  return (
    <div className="contact-page">
      <header className="contact-page__header">
        <h1>Contactez Julie & José</h1>
        <p>
          Une question, un devis, un brief événement ? Laissez-nous vos informations, nous vous
          recontactons dans les 24h pour définir vos besoins et vous proposer un menu sur mesure.
        </p>
      </header>

      <div className="contact-page__layout">
        <section className="contact-page__form">
          <h2>Formulaire de contact</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="contact-name">Nom et prénom</label>
              <input
                id="contact-name"
                required
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-email">Adresse e-mail</label>
              <input
                id="contact-email"
                type="email"
                required
                value={formState.email}
                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-title">Sujet</label>
              <input
                id="contact-title"
                type="text"
                required
                value={formState.title}
                onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Objet de votre demande"
              />
            </div>
            <div className="form-group">
              <div>
                <label htmlFor="contact-date">Date estimée</label>
                <input
                  id="contact-date"
                  type="date"
                  value={formState.eventDate}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, eventDate: event.target.value }))
                  }
                />
              </div>
              <div>
                <label htmlFor="contact-guests">Nombre d’invités</label>
                <input
                  id="contact-guests"
                  type="number"
                  min={1}
                  value={formState.guests}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, guests: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="contact-message">Votre projet</label>
              <textarea
                id="contact-message"
                rows={5}
                placeholder="Précisez le type d’événement, les contraintes, les régimes spécifiques..."
                value={formState.message}
                onChange={(event) => setFormState((prev) => ({ ...prev, message: event.target.value }))}
              />
            </div>
            <div className="form-group form-group--checkbox">
              <input
                id="contact-consent"
                type="checkbox"
                checked={formState.consent}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, consent: event.target.checked }))
                }
              />
              <label htmlFor="contact-consent">
                J’accepte que mes données soient traitées par Vite & Gourmand afin de répondre à ma
                demande. Les informations ne seront jamais vendues ou cédées à des tiers.
              </label>
            </div>
            <button type="submit" className="app-button app-button--large">
              Envoyer ma demande
            </button>
          </form>
          {status === 'success' && (
            <p role="status" className="form-success">
              Merci ! Votre demande a bien été reçue. Un e-mail de confirmation vous a été envoyé.
            </p>
          )}
        </section>

        <aside className="contact-page__aside">
          <div className="contact-card">
            <h2>Nos coordonnées</h2>
            <ul>
              <li>
                <strong>Adresse :</strong> 12 rue du Chai, 33000 Bordeaux
              </li>
              <li>
                <strong>Téléphone :</strong>{' '}
                <a href="tel:+33556000000" aria-label="Appeler le 05 56 00 00 00">
                  05 56 00 00 00
                </a>
              </li>
              <li>
                <strong>Email :</strong>{' '}
                <a href="mailto:contact@vite-gourmand.fr">contact@vite-gourmand.fr</a>
              </li>
              <li>
                <strong>Réseaux :</strong> @vite.gourmand (Instagram) · LinkedIn
              </li>
            </ul>
          </div>
          <div className="contact-card">
            <h2>Informations RGPD</h2>
            <p>
              Vite & Gourmand collecte vos données afin de répondre à vos demandes commerciales.
              Conformément au RGPD, vous pouvez exercer vos droits (accès, rectification, suppression)
              en écrivant à <a href="mailto:rgpd@vite-gourmand.fr">rgpd@vite-gourmand.fr</a>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

