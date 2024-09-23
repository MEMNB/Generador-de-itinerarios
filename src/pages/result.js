import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';

export default function Result() {
  const router = useRouter();
  const [itinerario, setItinerario] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false); // Nuevo estado de carga

  useEffect(() => {
    const { city, days } = router.query;
    if (city && days) {
      const generateItinerary = async () => {
        setCargando(true); // Inicia la carga
        try {
          const response = await fetch('/api/itinerario', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ciudad: city, dias: days }),
          });

          const data = await response.json();
          if (response.ok) {
            setItinerario(data.itinerario);
          } else {
            setError(data.error || 'Error al generar el itinerario');
          }
        } catch (err) {
          setError('Error al conectar con el servidor');
        } finally {
          setCargando(false); // Termina la carga
        }
      };

      generateItinerary();
    }
  }, [router.query]);

  return (
    <div className="container">
      
      {cargando ? (
        <p className="alert alert-danger mt-3 text-center fs-4 fw-bold">Cargando... Espera un momento</p> // Mensaje de carga
      ) : itinerario ? (
        <div className="bg-white p-4 rounded-3 shadow-custom">
          <ReactMarkdown className="markdown-content">
            {itinerario}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="alert alert-danger mt-3">{error}</p>
      )}

      <div className="d-flex justify-content-center">
      <button onClick={() => router.push('/')} className="btn btn-warning fw-bold mt-2 mb-3 btn-lg shadow-sm rounded-pill">
        Hacer otro itinerario
      </button>
      </div>

    </div>
  );
}