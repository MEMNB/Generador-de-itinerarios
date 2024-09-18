import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Home() {
  const router = useRouter();
  const [ciudad, setCiudad] = useState('');
  const [dias, setDias] = useState('');
  const [itinerario, setItinerario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      const { success, city, days } = router.query;
      if (success === 'true' && city && days) {
        setCiudad(city);
        setDias(days);
        setGenerando(true);
        generateItinerary(city, days);
      }
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    generateItinerary();
  }, [generateItinerary]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setItinerario('');

    try {
      const stripe = await stripePromise;
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ciudad, dias }),
      });

      const session = await response.json();
      
      if (response.ok) {
        setSessionId(session.id);
        const result = await stripe.redirectToCheckout({
          sessionId: session.id,
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
  };

  const generateItinerary = async (cityParam, daysParam) => {
    setLoading(true);
    try {
      const response = await fetch('/api/itinerario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ciudad: cityParam || ciudad, dias: daysParam || dias, sessionId }),
      });

      const data = await response.json();
      if (response.ok) {
        setItinerario(data.itinerario);
        setGenerando(false);
      } else {
        setError(data.error || 'Error al generar el itinerario');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="fs-1 d-flex align-items-center" style={{marginBottom: '2rem'}}>
        Generador de Itinerarios
        <i className="bi bi-luggage ms-2"></i>
      </h1>

      {generando ? (
        <div>
          <p>Generando itinerario para {ciudad} durante {dias} días...</p>
          {loading && <p>Por favor, espere...</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="ciudad" className="fs-3">Ciudad:</label>
            <input
              type="text"
              id="ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              required
              style={{ 
                width: '100%', padding: '0.5rem', marginTop: '0.5rem', 
                border: '2px solid black', borderRadius: '5px',
                fontFamily: 'Times New Roman', fontSize: '1.2rem' 
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="dias" className="fs-3">Días de estancia:</label>
            <input
              type="number"
              id="dias"
              value={dias}
              onChange={(e) => setDias(e.target.value)}
              required
              style={{ 
                width: '100%', padding: '0.5rem', marginTop: '0.5rem', 
                border: '2px solid black', borderRadius: '5px' 
              }}
            />
          </div>

          <button type="submit" className="btn btn-dark" style={{ padding: '0.75rem 1.5rem' }}>
            {loading ? 'Generando...' : 'Pagar y Generar Itinerario (1€)'}
          </button>
        </form>
      )}

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {itinerario && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Itinerario Sugerido para {ciudad} ({dias} días):</h2>
          <ReactMarkdown style={{ whiteSpace: 'pre-wrap', padding: '1rem', backgroundColor: '#f0f0f0' }}>
            {itinerario}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
