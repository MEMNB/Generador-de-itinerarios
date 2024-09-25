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

          if (error) throw error;

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

  const downloadItinerary = () => {
    const element = document.createElement("a");
    const file = new Blob([itinerary], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Itinerario_${router.query.city}_${router.query.days}dias.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container">
      {loading ? (
        <p className="alert alert-warning mt-3 text-center fs-4 fw-bold">Cargando... Espera un momento mientras se genera la magia</p>
      ) : itinerary ? (
        <div className="bg-white p-4 rounded-3 shadow-custom mb-5">
          <ReactMarkdown className="markdown-content">
            {itinerary}
          </ReactMarkdown>
          <button 
            onClick={downloadItinerary} 
            className="btn btn-generate btn-lg w-100"
          >
            Descargar Itinerario 📥
          </button>
        </div>
      ) : (
        <p className="alert alert-danger mt-3">{error}</p>
      )}

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
    </div>
  );
}