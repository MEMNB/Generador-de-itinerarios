import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-08-01' });
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { city, days, redirect_url } = req.body;
      const amount = 100; // En centavos, por ejemplo, $10.00

      const itineraryId = uuidv4();

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name:  `Guía de viaje para ${city} por ${days} días`,
            },
            unit_amount: amount,
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
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
