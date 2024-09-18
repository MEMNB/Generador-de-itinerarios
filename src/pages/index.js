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
    <div className="container-fluid p-0">
      <header className="bg-primary text-white text-center py-5">
        <h1 className="display-4 mb-3">✈️ TuItinerarioMágico</h1>
        <p className="lead mb-4">¡Planifica tu viaje perfecto en segundos! 🌟</p>
        
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow">
                <div className="card-body p-4">
                  <h2 className="card-title text-primary mb-4">¡Crea tu itinerario ahora! 🚀</h2>
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
                    <div className="mb-4">
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
                    <button type="submit" className="btn btn-primary btn-lg w-100">
                      {loading ? 'Creando magia... ✨' : '¡Generar mi itinerario por solo 1€! 💫'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="py-5">
        <section className="container mb-5">
          <h2 className="text-center mb-4">¿Cómo funciona? 🤔</h2>
          <div className="row g-4 justify-content-center">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-1-circle fs-1 text-primary mb-3"></i>
                  <h3 className="card-title h5">Elige tu destino</h3>
                  <p className="card-text">Ingresa la ciudad que quieres visitar.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-2-circle fs-1 text-primary mb-3"></i>
                  <h3 className="card-title h5">Define la duración</h3>
                  <p className="card-text">Indica cuántos días durará tu viaje.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-3-circle fs-1 text-primary mb-3"></i>
                  <h3 className="card-title h5">Recibe tu itinerario</h3>
                  <p className="card-text">¡Obtén un plan personalizado al instante!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mb-5">
          <h2 className="text-center mb-4">¿Por qué usar TuItinerarioMágico? 💡</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-clock fs-1 text-primary mb-3"></i>
                  <h3 className="card-title h5">Ahorra tiempo ⏱️</h3>
                  <p className="card-text">Obtén un itinerario completo en minutos, no en horas.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-geo-alt fs-1 text-primary mb-3"></i>
                  <h3 className="card-title h5">Descubre lo mejor 🗺️</h3>
                  <p className="card-text">Explora los lugares más increíbles de cada ciudad.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-person-check fs-1 text-primary mb-3"></i>
                  <h3 className="card-title h5">Personalizado para ti 👤</h3>
                  <p className="card-text">Itinerarios adaptados a la duración de tu viaje.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && <p className="alert alert-danger mt-3">{error}</p>}

        {itinerario && (
          <section className="container mt-5">
            <h2 className="text-center mb-4">¡Tu aventura está lista! 🎉</h2>
            <div className="bg-white p-4 rounded-3 shadow">
              <h3>Itinerario para {ciudad} ({dias} días):</h3>
              <ReactMarkdown className="markdown-content">
                {itinerario}
              </ReactMarkdown>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-dark text-white text-center py-3 mt-5">
        <p className="mb-0">© 2023 TuItinerarioMágico - Haz tus sueños de viaje realidad 💖</p>
      </footer>
    </div>
  );
}
