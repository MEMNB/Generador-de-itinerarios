import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Carga la clave pública de Stripe
const stripePromise = loadStripe('pk_test_51Pzx0wGxkNlvRGbbzUdwHgvc4Y58iv4u1BV6L3WLvujHwllqOlQIBBwGeiMEKCmLYaXvzFgF5XU8rxbBVtTqx01I00vpbX12c0');

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Solicita el clientSecret del backend
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: 100 }), // En centavos
    });
    const { clientSecret } = await response.json();

    // Realiza el pago con el clientSecret
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    });

    if (error) {
      console.log('[error]', error);
    } else {
      console.log('[PaymentIntent]', paymentIntent);
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