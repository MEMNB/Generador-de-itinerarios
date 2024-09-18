import axios from 'axios';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { ciudad, dias, sessionId } = req.body;


    try {

      // const session = await stripe.checkout.sessions.retrieve(sessionId);
      // if (session.payment_status !== 'paid') {
      //   return res.status(400).json({ error: 'El pago no ha sido completado' });
      // }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          "messages": [
            {
              role: "system",
              content: "Eres un creador de itinerarios y con la ciudad y el numero de días que recibas debes crear un itinerario adecuado a esos días"
            },
            {
              role: "user",
              content: `Quiero ir a ${ciudad} ${dias} días`,
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      

      //console.log({response});
      //console.log(response.data);
      

      const itinerario = response.data.choices[0].message.content.trim();
      const itinerarioConEspacios = itinerario.replace(/\n/g, '\n\n');
      res.status(200).json({ itinerario: itinerarioConEspacios});
    } catch (error) {
      console.error('Error en la generación del itinerario:', error);
      res.status(500).json({ error: 'Error al generar el itinerario' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
  }
}
