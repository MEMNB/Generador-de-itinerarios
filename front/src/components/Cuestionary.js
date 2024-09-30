import { useState } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function TravelForm({ onSubmit }) {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [days, setDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const stripe = await stripePromise;
      const body = JSON.stringify({ city, days, redirect_url: document.location.href });

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      const session = await response.json();
      
      if (response.ok) {
        const result = await stripe.redirectToCheckout({
          sessionId: session.session_id,
        });

        if (result.error) {
          setError(result.error.message);
        }
      } else {
        setError(session.error || 'Error al procesar el pago');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }

    if (onSubmit) {
      onSubmit({ city, days });
    }
  };

  return (
    <div className="card shadow-custom">
      <div className="card-body p-4">
        <h2 className="card-title text-dark text-center mb-4">Crea tu ruta de viaje (3 pasos)</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="city" className="form-label">1º¿Qué destino te hace soñar? 🌆</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
              <input
                type="text"
                className="form-control form-control-lg"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                placeholder="Ej: París, Roma, Tokio..."
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="days" className="form-label">2º ¿Cuántos días durará tu escapada? 📅</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-calendar-event"></i></span>
              <input
                type="number"
                className="form-control form-control-lg"
                id="days"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                required
                min="1"
                max="30"
                placeholder="Ej: 3, 5, 7..."
              />
            </div>
          </div>
          <button type="submit" className="btn btn-generate btn-lg w-100">
            {loading ? '¡Preparando tu ruta! ✈️' : '3º ¡Generar mi itinerario por solo 1€! 💫'}
          </button>
        </form>
        {error && <p className="alert alert-danger mt-3">{error}</p>}
      </div>
    </div>
  );
}