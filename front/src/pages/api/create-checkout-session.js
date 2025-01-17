import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid';
import { validateDiscountCode } from './validate-discount-code'; // Asegúrate de que esta función esté exportada

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-08-01' });
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)


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
    console.log('Datos recibidos:', req.body);
    const amount = 1200;

    const itineraryId = uuidv4();

    let price = amount;
    let session = {id: null}
    let discountValidation = { valid: false, percentage: 0 }; 

    if (discount_code) { 
      discountValidation = await validateDiscountCode(discount_code); 
    }

    if (discountValidation.valid) { 
      price = get_discounted_price(amount, discountValidation.percentage); 
    } else {
      price = amount;
    }

    if (price && price >= 50) {
      session = await stripe.checkout.sessions.create({
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
    }
  
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


function get_discounted_price(originalPrice, discountPercentage) {
  return parseInt(originalPrice * (1 - discountPercentage / 100)); 
}