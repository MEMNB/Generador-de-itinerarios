import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Cuestionary from '../components/Cuestionary';

export default function Home() {
  const router = useRouter();
  const [itinerary, setItinerary] = useState('');
  const [generando, setGenerando] = useState(false);
  const [showCookieNotice, setShowCookieNotice] = useState(true);

  const generateItinerary = useCallback(async ({ city, days }) => {
    setGenerando(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city, days }),
      });

      const data = await response.json();
      if (response.ok) {
        setItinerary(data.itinerary);
      } else {
        console.error('Error al generar el itinerario:', data.error);
      }
    } catch (err) {
      console.error('Error al conectar con el servidor:', err);
    } finally {
      setGenerando(false);
    }
  }, []);

  useEffect(() => {
    if (router.isReady) {
      const { success, city, days } = router.query;
      if (success === 'true' && city && days && !generando) {
        generateItinerary({ city, days });
        router.replace('/', undefined, { shallow: true });
      }
    }
  }, [router.isReady, router.query, generando, generateItinerary]);

  // Función para ocultar el aviso de cookies
  const hideCookieNotice = () => {
    setShowCookieNotice(false);
  };

  // Agregar event listener para ocultar el aviso al hacer clic
  useEffect(() => {
    const handleUserClick = () => {
      hideCookieNotice();
    };

    window.addEventListener('click', handleUserClick);

    // Limpiar el event listener al desmontar el componente
    return () => {
      window.removeEventListener('click', handleUserClick);
    };
  }, []);

  return (
    <div className="container-fluid p-0 main-container">
      {/* Aviso de cookies */}
      {showCookieNotice && (
        <div className="cookie-notice" style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #ccc',
          borderRadius: '5px',
          padding: '5px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          width: '200px', // Ajusta el ancho del cuadro
        }}>
          <p style={{ margin: 0, fontSize: '12px' }}>Este sitio utiliza cookies para mejorar la experiencia del usuario.</p>
          <p style={{ margin: 0, fontSize: '12px' }}>Al continuar navegando, aceptas el uso de cookies.</p>
        </div>
      )}

      <header className="custom-header">
        <h1 className="travel-plan-title" style={{ fontWeight: 700 }}>🗺️Ruta de Viaje</h1>
        <h3 className='travel-plan-p'>Crea tu ruta de viaje en un instante:</h3>
        <h3 className='travel-plan-p'> Ciudad + Días + Generar = Tu ruta de viaje</h3>
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
              <Cuestionary />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
