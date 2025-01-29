import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Cuestionary from '../components/Cuestionary';
import FAQ from '../components/FAQ';
import PopularDestination from '../components/PopularDestination';

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
          backgroundColor: '#ffffff',
          border: '1px solid #007bff',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          width: '250px', // Ajusta el ancho del cuadro
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>Este sitio utiliza cookies para mejorar la experiencia del usuario.</p>
          <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>Al continuar navegando, aceptas el uso de cookies.</p>
        </div>
      )}

        <div className="relative bg-slate-800 py-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80" 
            alt="World Map"
            className="w-full h-full object-cover"
          />
        </div>

      <header className="custom-header">
        <h1 className="travel-plan-title" style={{ fontWeight: 700 }}>🗺️Ruta de Viaje</h1>
        <h3 className='travel-plan-p'>Crea tu ruta de viaje en un instante:</h3>
        <h3 className='travel-plan-p'> Ciudad + Días + Generar = Tu ruta de viaje</h3>
        
      </header>
      
      </div>

      <main className="py-3">
        {itinerary && (
          <section className="container mb-5">
            <div className="card shadow-custom">
              <div className="card-body p-4">
                <ReactMarkdown className="markdown-content">
                  {itinerary}
                </ReactMarkdown>
              </div>
            </div>
          </section>
        )}

        <section className="container" style={{ marginTop: '-50px' }}>
          <div className="row justify-content-center">
            <div className="col-md-8" style={{ marginBottom: '20px' }}>
             <Cuestionary />
            </div>
          </div>
       </section>

      </main>

      <PopularDestination />

      <section className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <FAQ />
            </div>
          </div>
        </section>
      
    </div>
  );
}
