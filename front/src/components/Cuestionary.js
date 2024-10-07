import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Cuestionary({ onSubmit }) {
  const amount = 400;
  const router = useRouter();
  const [city, setCity] = useState('');
  const [days, setDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDiscountCode, setShowDiscountCode] = useState(false);
  const [price, setPrice] = useState(amount);
  const [discountCode, setDiscountCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const stripe = await stripePromise;
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          days,
          redirect_url: `https://${document.location.host}`,
          discount_code: discountCode
        }),
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
      onSubmit({ city, days, discountCode });
    }
  };

  const handleDiscountCodeToggle = () => {
    setShowDiscountCode(!showDiscountCode);
    if (!showDiscountCode) {
      setDiscountCode('');
      setDiscountMessage('');
      setPrice(amount);
    }
  };

  const validateDiscountCode = async () => {
    try {
      const response = await fetch('/api/validate-discount-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount_code: discountCode }),
      });
      const result = await response.json();
      if (response.ok && result.valid) {
        const newPrice = amount * (1 - result.percentage / 100);
        setPrice(newPrice);
        setDiscountMessage(`¡Descuento del ${result.percentage}% aplicado!`);
      } else {
        setPrice(amount);
        setDiscountMessage('Código no válido. Inténtalo de nuevo.');
      }
    } catch (error) {
      setDiscountMessage('Error al validar el código. Inténtalo más tarde.');
    }
  };

  return (
    <div className="card shadow-custom">
      <div className="card-body p-4">
        <h2 className="card-title text-dark text-center mb-4">Crea tu ruta de viaje</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="city" className="form-label">1. ¿Qué destino vas a visitar? 🌆</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
              <input
                type="text"
                className="form-control"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                placeholder="Ej: París, Roma, Tokio..."
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="days" className="form-label">2. ¿Cuántos días durará tu viaje? 📅</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-calendar-event"></i></span>
              <input
                type="number"
                className="form-control"
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

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 mb-3"
            disabled={loading}
          >
            {loading ? 'Preparando tu ruta... ✈️' : `3. ¡Generar mi itinerario por ${price/100}€! 💫`}
          </button>
          
          <div className="mb-1">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={handleDiscountCodeToggle}
              style={{ background: 'none', border: 'none', color: 'black', textDecoration: 'underline', cursor: 'pointer' }} // Cambios aquí
            >
              {showDiscountCode ? 'Ocultar código' : 'Aplicar código'}
            </button>
            {showDiscountCode && (
              <div className="mt-2">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Introduce tu código"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={validateDiscountCode}
                  >
                    Validar
                  </button>
                </div>
                {discountMessage && (
                  <div className={`alert mt-2 ${discountMessage.includes('aplicado') ? 'alert-success' : 'alert-warning'}`}>
                    {discountMessage}
                  </div>
                )}
              </div>
            )}
          </div>

          

        </form>

        {error && (
          <div className="alert alert-danger mt-3" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}