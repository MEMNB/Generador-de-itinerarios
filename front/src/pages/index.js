import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Cuestionary from '../components/Cuestionary';

export default function Home() {
  const router = useRouter();
  const [recipe, setRecipe] = useState('');
  const [generando, setGenerando] = useState(false);
  const [showCookieNotice, setShowCookieNotice] = useState(true);

  const generateRecipe = useCallback(async ({ ingredients }) => {
    setGenerando(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });

      const data = await response.json();
      if (response.ok) {
        setRecipe(data.recipe);
      } else {
        console.error('Error al generar la receta:', data.error);
      }
    } catch (err) {
      console.error('Error al conectar con el servidor:', err);
    } finally {
      setGenerando(false);
    }
  }, []);

  useEffect(() => {
    if (router.isReady) {
      const { success, ingredients } = router.query;
      if (success === 'true' && ingredients && !generando) {
        generateRecipe({ ingredients });
        router.replace('/', undefined, { shallow: true });
      }
    }
  }, [router.isReady, router.query, generando, generateRecipe]);

  
  const hideCookieNotice = () => {
    setShowCookieNotice(false);
  };

  
  useEffect(() => {
    const handleUserClick = () => {
      hideCookieNotice();
    };

    window.addEventListener('click', handleUserClick);


    return () => {
      window.removeEventListener('click', handleUserClick);
    };
  }, []);

  return (
    <div className="container-fluid p-0 main-container">
      
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
          width: '400px', 
        }}>
          <p style={{ margin: 0, fontSize: '12px' }}>Este sitio utiliza cookies para mejorar la experiencia del usuario.</p>
          <p style={{ margin: 0, fontSize: '12px' }}>Al continuar navegando, aceptas el uso de cookies.</p>
        </div>
      )}

      <header className="custom-header">
        <h1 className="travel-plan-title" style={{ fontWeight: 700 }}>🥞¿Qué como hoy?</h1>
        <h3 className='travel-plan-p'>Crea tu receta en un instante:</h3>
        <h3 className='travel-plan-p'> Añade los ingredientes que tengas en casa y te generamos una receta</h3>
      </header>

      <main className="py-3">
        {recipe && (
          <section className="container mb-5">
            <div className="bg-white p-4 rounded-3 shadow-custom">
              <ReactMarkdown className="markdown-content">
                {recipe}
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
