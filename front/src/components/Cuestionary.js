import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import 'bootstrap-icons/font/bootstrap-icons.css';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Cuestionary({ onSubmit }) {
  const amount = 400;
  const router = useRouter();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDiscountCode, setShowDiscountCode] = useState(false);
  const [price, setPrice] = useState(amount);
  const [discountCode, setDiscountCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [ingredientHint, setIngredientHint] = useState('');

  useEffect(() => {
    const codigoDescuento = router.query.codigo;
    if (codigoDescuento) {
      setDiscountCode(codigoDescuento);
      validateDiscountCode(codigoDescuento);  
    }
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const stripe = await stripePromise;
      const base_url = `https://${document.location.host}`
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          days,
          redirect_url: base_url,
          discount_code: discountCode
        }),
      });

      const session = await response.json();

      
      if (response.ok && session && session.session_id != null) {

        const result = await stripe.redirectToCheckout({
          sessionId: session.session_id,
        });

        if (result.error) {
          setError(result.error.message);
        }
      } else {
        if (session.itineraryId) {
          document.location.href = `${base_url}/r/${session.itineraryId}`
        } else {
          setError(session.error || 'Error al procesar el pago');
        }
      
      }
    } catch (err) {
      console.log({err})
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }

    if (onSubmit) {
      onSubmit({ ingredients: ingredients.split(', '), discountCode }); // Asegúrate de pasar los ingredientes como un array
    }
  };

  const handleDiscountCodeToggle = () => {
    setShowDiscountCode(!showDiscountCode);
    if (!showDiscountCode) {
      setDiscountCode('');
      setDiscountMessage('');
      setPrice(amount);
    }
  };

  
  const validateDiscountCode = async (code = discountCode) => {
    try {
      const response = await fetch('/api/validate-discount-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount_code: code }),
      });
      const result = await response.json();
      if (response.ok && result.valid) {
        const newPrice = amount * (1 - result.percentage / 100);
        setPrice(newPrice);
        setDiscountMessage(`¡Descuento del ${result.percentage}% aplicado!`);
      } else {
        setPrice(amount);
        setDiscountMessage('Código no válido. Inténtalo de nuevo.');
      }
    } catch (error) {
      setDiscountMessage('Error al validar el código. Inténtalo más tarde.');
    }
  };

  const handleIngredientChange = (e) => {
    const value = e.target.value;
    setIngredients(value.split(',').map(ingredient => ingredient.trim())); // Actualiza el estado como un array
  };

  const handleIngredientSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newIngredient = e.target.value.trim();
      if (newIngredient) {
        // Actualiza el estado con los ingredientes separados por comas
        const updatedIngredients = [...ingredients, newIngredient].join(', ');
        setIngredients(updatedIngredients.split(',').map(ingredient => ingredient.trim())); // Mantén el estado como un array
        e.target.value = ''; // Limpia el cuadro de entrada
        setIngredientHint('');
      }
    }
  };

  return (
    <div className="card shadow-custom">
      <div className="card-body p-4">
        <h2 className="card-title text-dark text-center mb-4">Crea tu ruta de viaje</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="ingredients" className="form-label">1. ¿Qué ingredientes tienes en casa? 🌆</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
              <input
                type="text"
                className="form-control"
                id="ingredients"
                onKeyDown={handleIngredientSubmit}
                onChange={handleIngredientChange}
                required
                placeholder="Ej: Pollo, Harina, Lentejas..."
              />
            </div>
             <p className='mt-2'>Asegúrate de separar los ingredientes con comas.</p>
          </div>
          

          <button
            type="submit"
            className="btn btn-warning btn-lg w-100 mb-3"
            disabled={loading}
          >
            {loading ? 'Preparando tu ruta... ✈️' : (price < 50 ? '3. ¡Gratis! 💫' : `3. ¡Generar mi itinerario por ${price / 100}€! 💫`)}
          </button>
          
          <div className="mb-1">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={handleDiscountCodeToggle}
              style={{ background: 'none', border: 'none', color: 'black', textDecoration: 'underline', cursor: 'pointer' }}
            >
              {showDiscountCode ? 'Ocultar código' : 'Aplicar código'}
            </button>
            {showDiscountCode && (
              <div className="mt-2">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Introduce tu código"
                    style={{ boxShadow: 'none' }} 
                  />
                  <button
                    type="button"
                    className="btn btn-outline-warning"
                    onClick={() => validateDiscountCode(discountCode)}
                  >
                    Validar
                  </button>
                </div>
                {discountMessage && (
                  <div className={`alert mt-2 ${discountMessage.includes('aplicado') ? 'alert-success' : 'alert-warning'}`}>
                    {discountMessage}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h4>Ingredientes:</h4>
            <ul>
              {ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

        </form>

        {error && (
          <div className="alert alert-danger mt-3" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
