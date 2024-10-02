import { useState } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Cuestionary({ onSubmit }) {
  const amount = 500;

  const router = useRouter();
  const [city, setCity] = useState('');
  const [days, setDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDiscountCode, setShowDiscountCode] = useState(false);
  const [price, setPrice] = useState(amount);
  const [discountCode, setDiscountCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const stripe = await stripePromise;
      const body = JSON.stringify({
        city,
        days,
        redirect_url: `https://${document.location.host}`,
        discount_code: discountCode
      });

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
      onSubmit({ city, days, discountCode });
    }
  };

  const handleDiscountCodeToggle = () => {
    setShowDiscountCode(!showDiscountCode);
  };

  return (
    <div className="card shadow-custom">
      <div className="card-body p-4">
        <h2 className="card-title text-dark text-center mb-4">Crea tu ruta de viaje (3 pasos)</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="city" className="form-label">1º¿Qué destino vas a visitar? 🌆</label>
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
            <label htmlFor="days" className="form-label">2º ¿Cuántos días durará tu viaje? 📅</label>
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
            {loading ? '¡Preparando tu ruta! ✈️' : `3º ¡Generar mi itinerario por solo ${price/100}€! 💫`}
          </button>
          <div className="text-center mt-2">
            <a href="#" className="text-decoration-none" onClick={handleDiscountCodeToggle}>
              {showDiscountCode ? 'Ocultar código' : 'Aplicar código'}
            </a>
          </div>
          {showDiscountCode && (
            <div className="mt-2">
              <input
                type="text"
                className="form-control"
                placeholder="Introduce tu código de descuento"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <input
                type='button'
                value='Validar'
                style={{
                  backgroundColor: '#007bff', // Color de fondo
                  color: '#fff', // Color del texto
                  border: 'none', // Sin borde
                  padding: '10px 20px', // Espaciado interno
                  borderRadius: '5px', // Bordes redondeados
                  cursor: 'pointer', // Cambia el cursor al pasar el mouse
                  marginTop: '10px', // Margen superior
                }}
                onClick={async () => {
                  const response = await fetch('/api/validate-discount-code', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ discount_code: discountCode }),
                  });
                  const result = await response.json();
                  if (response.ok) {
                    if (result.valid) {
                      setError('Código de descuento aplicado correctamente');
                      setPrice(amount * (result.percentage / 100));
                    } else {
                      setPrice(amount);
                      setError('Código de descuento no válido');
                    }
                  }
                }}
              />
              {error && (
                <div className="mt-2">
                  {error} {/* Muestra el mensaje sin estilo de alerta */}
                </div>
              )}
            </div>
          )}
        </form>
        {error && <p className="alert alert-danger mt-3">{error}</p>}
      </div>
    </div>
  );
}