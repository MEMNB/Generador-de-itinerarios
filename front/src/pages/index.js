import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { loadStripe } from '@stripe/stripe-js';
import Head from 'next/head';
import Image from 'next/image';


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Home() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [days, setDays] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [generando, setGenerando] = useState(false);

  const generateItinerary = useCallback(async (cityParam, daysParam) => {
    console.log('Llamada a generateItinerary:', { cityParam, daysParam });
    console.log('Generando itinerario para:', cityParam || city, 'durante', daysParam || days, 'días');
    setLoading(true);
    try {
      const response = await fetch('/api/itinerario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city: cityParam, days: daysParam }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Itinerario generado exitosamente');
        setItinerary(data.itinerary);
        setGenerando(false);
      } else {
        console.error('Error al generar el itinerario:', data.error);
        setError(data.error || 'Error al generar el itinerario');
      }
    } catch (err) {
      console.error('Error al conectar con el servidor:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (router.isReady) {
      const { success, city, days } = router.query;
      console.log('Parámetros de URL:', { success, city, days });
      if (success === 'true' && city && days && !generando) { // Añadir !generando para evitar llamadas múltiples
        setCity(city);
        setDays(days);
        setGenerando(true);
        console.log('Iniciando generación de itinerario para:', city, 'durante', days, 'días');
        generateItinerary(city, days);
        // Eliminar los parámetros de consulta de la URL
        router.replace('/', undefined, { shallow: true });
      }
    }
  }, [router.isReady, router.query, generando]); // Añadir generando como dependencia

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Iniciando proceso de pago para:', city, 'durante', days, 'días');
    setLoading(true);
    setError('');
    setItinerary('');

    try {
      console.log("init");

      const stripe = await stripePromise;
      console.log("pasa");
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city, days, redirect_url: document.location.href }),
      });

      const session = await response.json();
      console.log('Sesión de Stripe creada:', session.session_id);
      
      if (response.ok) {
        setSessionId(session.session_id);
        const result = await stripe.redirectToCheckout({
          sessionId: session.session_id,
        });

        if (result.error) {
          setError(result.error.message);
        }
        // else {
        //   // Redirigir a result.js con los parámetros necesarios
        //   router.push({
        //     pathname: '/result',
        //     query: { city, days }
        //   });
        // }
      } else {
        console.error('Error en la respuesta del servidor:', session.error);
        setError(session.error || 'Error al procesar el pago');
      }
    } catch (err) {
      console.error('Error al conectar con el servidor:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container-fluid p-0 main-container">
        <header className="custom-header">
          <h1 className="travel-plan-title" style={{ fontWeight: 700 }}>🗺️ Itinero</h1>
          <p className='travel-plan-p'>Creador de rutas de viaje inteligente</p>
        </header>

        <main className="py-3">
          {itinerary && (
            <section className="container mb-5">
              <div className="bg-white p-4 rounded-3 shadow-custom">
                <ReactMarkdown className="markdown-content">
                  {itinerary}
                </ReactMarkdown>
              </div>
            </section>
          )}

          <section className="container">
            <div className="row justify-content-center">
              <div className="col-md-8">
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
                        {loading ? '¡Preparando tu aventura! ✈️' : '3º ¡Generar mi itinerario por solo 1€! 💫'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && <p className="alert alert-danger mt-3">{error}</p>}
        </main>
      </div>
    </>
  );
}