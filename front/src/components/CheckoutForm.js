import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Carga la clave pública de Stripe
const stripePromise = loadStripe('process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY');

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    console.log('Iniciando proceso de pago...');

    // Solicita el clientSecret del backend
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: 1200 }), // En centavos
    });
    const { clientSecret } = await response.json();
    console.log('ClientSecret recibido:', clientSecret);

    // Realiza el pago con el clientSecret
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    });

    if (error) {
      console.log('Error en el pago:', error);
    } else {
      console.log('Pago exitoso. PaymentIntent:', paymentIntent);
      // Confirmar el éxito del pago
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Pagar</button>
    </form>
  );
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}