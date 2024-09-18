import axios from 'axios';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  console.log('Recibida solicitud para generar itinerario');
  console.log('Cuerpo de la solicitud:', req.body);

  if (req.method === 'POST') {
    const { ciudad, dias } = req.body;
    console.log('Datos recibidos:', { ciudad, dias });

    try {
      /*if (!sessionId) {
        console.log('Error: sessionId no proporcionado');
        return res.status(400).json({ error: 'Se requiere sessionId' });
      }*/

      // console.log('Intentando recuperar la sesión de Stripe');
      // const session = await stripe.checkout.sessions.retrieve(sessionId);
      // console.log('Sesión de Stripe recuperada:', session.payment_status);

      // if (session.payment_status !== 'paid') {
      //   console.log('Error: El pago no ha sido completado');
      //   return res.status(400).json({ error: 'El pago no ha sido completado' });
      // }

      console.log('Preparando solicitud a OpenAI');
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          "messages": [
            {
              role: "system",
              content: "Eres un creador de itinerarios y con la ciudad y el numero de días que recibas debes crear un itinerario adecuado a esos días. Cuando proporciones itinerarios o listas de actividades, incluye emoticonos apropiados junto a cada elemento para hacerlo más visual y atractivo. Por ejemplo, usa ⏰ para horarios, 🍽️ para comidas, 🏛️ para visitas culturales, etc."
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
      console.log('Respuesta recibida de OpenAI');

      if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        console.log('Error: Respuesta inesperada de OpenAI', response.data);
        throw new Error('Respuesta inesperada de la API de OpenAI');
      }

      const itinerario = response.data.choices[0].message.content.trim();
      console.log('Itinerario generado con éxito');

      const itinerarioConEspacios = itinerario.replace(/\n/g, '\n\n');
      res.status(200).json({ itinerario: itinerarioConEspacios });
    } catch (error) {
      console.error('Error en el servidor:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    console.log('Método no permitido:', req.method);
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
  }
}
