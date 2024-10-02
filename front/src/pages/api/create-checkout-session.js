import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-08-01' });
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Define tu código de descuento
const VALID_DISCOUNT_CODE = 'DESCUENTO50'; // Cambia esto por tu código deseado

// Función para validar el código de descuento
function is_valid_discount_code(code) {
  return code === VALID_DISCOUNT_CODE; // Verifica si el código es válido
}

export default async function handler(req, res) {
  console.log('Método de la solicitud:', req.method);
  console.log('URL de la solicitud:', req.url);
  console.log('Encabezados de la solicitud:', req.headers);
  console.log('Cuerpo de la solicitud:', req.body);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  try {
    const { city, days, redirect_url, discount_code } = req.body;
    const amount = 500;

    const itineraryId = uuidv4();

    let price = amount;
    if (discount_code && is_valid_discount_code(discount_code)) {
      price = get_discounted_price(amount); // Pasar el monto original
    }
    else {
      price = amount;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name:  `Guía de viaje para ${city} por ${days} días`,
          },
          unit_amount: price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${redirect_url}/r/${itineraryId}`,
      cancel_url: `${redirect_url}?canceled=true`,
    });

    const { data, error } = await supabase
      .from('itineraries')
      .insert([
        { id: itineraryId, days: days, city: city, stripe_session_id: session.id },
      ])
      .select()

    res.status(200).json({ session_id: session.id, itineraryId: itineraryId });
  } catch (error) {
    console.error('Error en el servidor:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Agrega esta función para calcular el precio con descuento
function get_discounted_price(originalPrice) {
  return originalPrice * 0.5; // 50% de descuento
}