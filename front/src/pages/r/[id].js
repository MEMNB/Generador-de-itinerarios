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
  const [recipe, setRecipe] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Cambiado a true inicialmente
  const [ingredients, setIngredients] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [isReady, setIsReady] = useState(false); // Nuevo estado
  const [newRecipeLoading, setNewRecipeLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    setIsReady(true);
    const { id } = router.query;
    if (id) {
      const fetchRecipe = async () => {
        setLoading(true);
        try {
          
          const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            setNotFound(true);
          }

          if (data) {
            setIngredients(data.ingredients);

            if (data.result) {
              setRecipe(data.result);
              setLoading(false);
            } else {
              
              await generateRecipe(data.ingredients, id);
            }
          } else {
            setError('Receta no encontrado');
            setLoading(false);
          }
        } catch (err) {
          setError('Error al obtener la receta');
          setLoading(false);
        }
      };

      fetchRecipe();
    }
  }, [router.isReady, router.query]);

  const generateRecipe = async (ingredients, id) => {
    try {
      const response = await fetch('https://tjbqkrgjisrjfrltdnpm.supabase.co/functions/v1/recipegenerator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });

      const data = await response.json();
      if (response.ok) {
        setIngredients(data.result);
        /
        const { error } = await supabase
          .from('recipes')
          .update({ result: data.result })
          .eq('id', id);

        if (error) throw error;
      } else {
        setError(data.error || 'Error al generar la receta');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleNewRecipe = async (ingredients) => {
    setNewRecipeLoading(true);
    try {
      const response = await fetch('https://tjbqkrgjisrjfrltdnpm.supabase.co/functions/v1/recipegenerator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });

      const data = await response.json();
      if (response.ok) {
        
        const { data: newRecipe, error } = await supabase
          .from('recipes')
          .insert({ ingredients, result: data.result })
          .single();

        if (error) throw error;

        
        router.push(`/r/${newRecipe.id}`);
      } else {
        setError(data.error || 'Error al generar la receta');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setNewRecipeLoading(false);
    }
  };

  const shareRecipe = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receta con estos ${ingredients} ingredientes`,
          text: `¡Mira esta increíble receta con ${ingredients}!`,
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
        <h1 className="display-1 text-warning">404</h1>
        <h2 className="display-4 mb-4">¡Oops! Parece que te has perdido en el viaje</h2>
        <p className="lead mb-4">
          No hemos podido encontrar la receta que buscas. Pero no te preocupes, ¡hay muchas más recetas por explorar!
        </p>
        {/* <img src="/lost-traveler.svg" alt="Viajero perdido" className="img-fluid mb-4" style={{maxWidth: '300px'}} /> */}
        <div>
          <button onClick={() => router.push('/')} className="btn btn-warning btn-lg">
            Volver a la página principal y probar una nueva receta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-warning" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 fs-4 fw-bold text-warning">¡Estamos creando tu receta personalizada!</p>
          <p className="fs-5">Prepárate para descubrir experiencias únicas en {ingredients}. Esto puede tomar unos momentos...</p>
        </div>
      ) : recipe ? (
        <>
          <div className="bg-white p-4 rounded-3 shadow-custom mb-5">
            <ReactMarkdown className="markdown-content">
              {recipe}
            </ReactMarkdown>
            <button 
              onClick={shareRecipe} 
              className="btn btn-generate btn-lg w-100"
            >
              Compartir Receta 📤
            </button>
          </div>
          
          <section className="container">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <Cuestionary onSubmit={handleNewRecipe} isLoading={newRecipeLoading} />
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