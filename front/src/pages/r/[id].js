import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import { loadStripe } from '@stripe/stripe-js';
import { createClient } from '@supabase/supabase-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Result() {
  const router = useRouter();
  const [itinerary, setItinerary] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('');
  const [days, setDays] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const { id } = router.query;
    if (id) {
      const fetchItinerary = async () => {
        setLoading(true);
        try {
          // Buscar el itinerario en Supabase
          const { data, error } = await supabase
            .from('itineraries')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            setNotFound(true);
          }

          if (data) {
            setCity(data.city);
            setDays(data.days);

            if (data.result) {
              setItinerary(data.result);
              setLoading(false);
            } else {
              // Si no hay resultado, generar el itinerario
              await generateItinerary(data.city, data.days, id);
            }
          } else {
            setError('Itinerario no encontrado');
            setLoading(false);
          }
        } catch (err) {
          setError('Error al obtener el itinerario');
          setLoading(false);
        }
      };

      fetchItinerary();
    }
  }, [router.query]);

  const generateItinerary = async (city, days, id) => {
    try {
      const response = await fetch('https://tjbqkrgjisrjfrltdnpm.supabase.co/functions/v1/itinerarygenerator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city, days }),
      });

      const data = await response.json();
      if (response.ok) {
        setItinerary(data.result);
        // Guardar el resultado en Supabase
        const { error } = await supabase
          .from('itineraries')
          .update({ result: data.result })
          .eq('id', id);

        if (error) throw error;
      } else {
        setError(data.error || 'Error al generar el itinerario');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const shareItinerary = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Itinerario para ${city} - ${days} días`,
          text: `¡Mira este increíble itinerario para ${city}!`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error al compartir:', error);
      }
    } else {
      alert('Tu navegador no soporta la función de compartir. Intenta copiar el enlace manualmente.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const stripe = await stripePromise;
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city, days, redirect_url: window.location.origin }),
      });

      const session = await response.json();
      
      if (response.ok) {
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

  if (notFound) {
    return (
      <div className="container text-center mt-5">
        <h1 className="display-1 text-primary">404</h1>
        <h2 className="display-4 mb-4">¡Oops! Parece que te has perdido en el viaje</h2>
        <p className="lead mb-4">
          No hemos podido encontrar el itinerario que buscas. Pero no te preocupes, ¡hay muchos más destinos por explorar!
        </p>
        {/* <img src="/lost-traveler.svg" alt="Viajero perdido" className="img-fluid mb-4" style={{maxWidth: '300px'}} /> */}
        <div>
          <button onClick={() => router.push('/')} className="btn btn-primary btn-lg">
            Volver a la página principal y planear una nueva aventura
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 fs-4 fw-bold text-primary">¡Estamos creando tu itinerario personalizado!</p>
          <p className="fs-5">Prepárate para descubrir experiencias únicas en {city}. Esto puede tomar unos momentos...</p>
        </div>
      ) : itinerary ? (
        <div className="bg-white p-4 rounded-3 shadow-custom mb-5">
          <ReactMarkdown className="markdown-content">
            {itinerary}
          </ReactMarkdown>
          <button 
            onClick={shareItinerary} 
            className="btn btn-generate btn-lg w-100"
          >
            Compartir Itinerario 📤
          </button>
        </div>
      ) : (
        <p className="alert alert-danger mt-3">{error}</p>
      )}

      {!loading && (
        <>
          <div className="card shadow-custom mt-5">
            <div className="card-body p-4">
              <h2 className="card-title text-dark text-center mb-4">¿Quieres generar otro itinerario? 🚀</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="city" className="form-label">¿A dónde quieres ir? 🌆</label>
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
                  <label htmlFor="days" className="form-label">¿Cuántos días te quedas? 📅</label>
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
                  {loading ? 'Creando magia... ✨' : '¡Generar mi itinerario por solo 1€! 💫'}
                </button>
              </form>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-3">
            <button onClick={() => router.push('/')} className="btn btn-warning fw-bold mt-2 mb-3 btn-lg shadow-sm rounded-pill">
              Volver a la página principal
            </button>
          </div>
        </>
      )}
    </div>
  );
}