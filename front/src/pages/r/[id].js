import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import { loadStripe } from '@stripe/stripe-js';
import { createClient } from '@supabase/supabase-js';
import Cuestionary from '../../components/Cuestionary';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Result() {
  const router = useRouter();
  const [itinerary, setItinerary] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Cambiado a true inicialmente
  const [city, setCity] = useState('');
  const [days, setDays] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [isReady, setIsReady] = useState(false); // Nuevo estado
  const [newItineraryLoading, setNewItineraryLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    setIsReady(true);
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
  }, [router.isReady, router.query]);

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

  const handleNewItinerary = async (city, days) => {
    setNewItineraryLoading(true);
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
        // Crear un nuevo registro en la base de datos
        const { data: newItinerary, error } = await supabase
          .from('itineraries')
          .insert({ city, days, result: data.result })
          .single();

        if (error) throw error;

        // Redirigir a la nueva página de itinerario
        router.push(`/r/${newItinerary.id}`);
      } else {
        setError(data.error || 'Error al generar el itinerario');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setNewItineraryLoading(false);
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

  if (!isReady) return null; // No renderizar nada hasta que el router esté listo

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
        <>
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
          
          <section className="container">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <Cuestionary onSubmit={handleNewItinerary} isLoading={newItineraryLoading} />
              </div>
            </div>
          </section>

          <div className="d-flex justify-content-center mt-3">
            <button onClick={() => router.push('/')} className="btn btn-generate fw-bold mt-2 mb-3 btn-lg rounded">
              Volver a la página principal
            </button>
          </div>
        </>
      ) : (
        <p className="alert alert-danger mt-3">{error}</p>
      )}
    </div>
  );
}