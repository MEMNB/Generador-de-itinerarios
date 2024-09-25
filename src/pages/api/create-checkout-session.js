import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-08-01' });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { city, days, redirect_url } = req.body;

      // Codificar los parámetros de la URL
      const encodedCity = encodeURIComponent(city);
      const encodedDays = encodeURIComponent(days);

      // Puedes ajustar el monto según sea necesario
      const amount = 100; // En centavos, por ejemplo, $10.00

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Generar itinerario para ${city} por ${days} días`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${redirect_url}/result/?success=true&city=${encodedCity}&days=${encodedDays}`,
        cancel_url: `${redirect_url}?canceled=true`,
      });

      res.status(200).json({ id: session.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
