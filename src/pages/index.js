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
  const [ciudad, setCiudad] = useState('');
  const [dias, setDias] = useState('');
  const [itinerario, setItinerario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [generando, setGenerando] = useState(false);

  const generateItinerary = useCallback(async (cityParam, daysParam) => {
    console.log('Llamada a generateItinerary:', { cityParam, daysParam });
    console.log('Generando itinerario para:', cityParam || ciudad, 'durante', daysParam || dias, 'días');
    setLoading(true);
    try {
      const response = await fetch('/api/itinerario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ciudad: cityParam, dias: daysParam }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Itinerario generado exitosamente');
        setItinerario(data.itinerario);
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
      if (success === 'true' && city && days) {
        setCiudad(city);
        setDias(days);
        setGenerando(true);
        console.log('Iniciando generación de itinerario para:', city, 'durante', days, 'días');
        generateItinerary(city, days);
        // Eliminar los parámetros de consulta de la URL
        router.replace('/', undefined, { shallow: true });
      }
    }
  }, [router.isReady, router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Iniciando proceso de pago para:', ciudad, 'durante', dias, 'días');
    setLoading(true);
    setError('');
    setItinerario('');

    try {
      console.log("init");
      const stripe = await stripePromise;
      console.log("pasa");
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ciudad, dias, redirect_url: document.location.href }),
      });

      const session = await response.json();
      console.log('Sesión de Stripe creada:', session.id);
      
      if (response.ok) {
        setSessionId(session.id);
        const result = await stripe.redirectToCheckout({
          sessionId: session.id,
        });

        if (result.error) {
          setError(result.error.message);
        } else {
          // Redirigir a result.js con los parámetros necesarios
          router.push({
            pathname: '/result',
            query: { city: ciudad, days: dias }
          });
        }
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
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <div className="container-fluid p-0">
        <header className="bg-warning bg-gradient text-white py-4 mb-4">
          <h1 className="mb-3 text-center travel-plan-title">🗺️ TravelPlan</h1>
        </header>

        <main className="py-3">
          {itinerario && (
            <section className="container mb-5">
              <div className="bg-white p-4 rounded-3 shadow-custom">
                <ReactMarkdown className="markdown-content">
                  {itinerario}
                </ReactMarkdown>
              </div>
            </section>
          )}

          <section className="container">
            <div className="row">
              <div className="col-md-6 mb-4 mb-md-0">
                <Image 
                  src="/images/tu-imagen.jpg" 
                  alt="Descripción de la imagen" 
                  width={500} 
                  height={300} 
                  layout="responsive" 
                  className="rounded shadow-custom" 
                />
              </div>
              <div className="col-md-6">
                <div className="card border-warning border-3 shadow-custom">
                  <div className="card-body p-4">
                    <h2 className="card-title text-dark text-center mb-4">¡Crea tu itinerario ahora! 🚀</h2>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="ciudad" className="form-label">¿A dónde quieres ir? 🌆</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            id="ciudad"
                            value={ciudad}
                            onChange={(e) => setCiudad(e.target.value)}
                            required
                            placeholder="Ej: París, Roma, Tokio..."
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="dias" className="form-label">¿Cuántos días te quedas? 📅</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-calendar-event"></i></span>
                          <input
                            type="number"
                            className="form-control form-control-lg"
                            id="dias"
                            value={dias}
                            onChange={(e) => setDias(e.target.value)}
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
              </div>
            </div>
          </section>

          {error && <p className="alert alert-danger mt-3">{error}</p>}
        </main>
      </div>

      <style jsx>{`
        .travel-plan-title {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 3.5rem;
          color: #333;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          letter-spacing: 1px;
        }
        
        :global(.shadow-custom) {
          box-shadow: 0 0.5rem 1rem rgba(255, 193, 7, 0.3) !important;
        }

        :global(.img-fluid) {
          max-height: 100%;
          object-fit: cover;
        }

        :global(.btn-generate) {
          background-color: #343a40;
          border-color: #343a40;
          color: white !important;
          font-weight: bold;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }

        :global(.btn-generate:hover) {
          background-color: #23272b;
          border-color: #1d2124;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }

        :global(.btn-generate:focus, .btn-generate:active) {
          color: white !important;
          box-shadow: 0 0 0 0.2rem rgba(52, 58, 64, 0.5), 0 4px 6px rgba(0, 0, 0, 0.2);
        }

        :global(.markdown-content) {
          line-height: 1.6;
        }
      `}</style>
    </>
  );
}