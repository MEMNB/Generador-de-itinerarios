import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method === 'POST') {
    try {
      const { city, days } = await req.json()
      console.log('Datos recibidos:', { city, days })

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: "system",
              content: "Eres un planificador de itinerarios experto y con la ciudad y el numero de días que recibas debes crear un itinerario de viaje adecuado a esos días. Cuando proporciones itinerarios, incluye emoticonos apropiados junto a cada elemento para hacerlo más visual y atractivo. Por ejemplo, usa ⏰ para horarios, 🍽️ para comidas, 🏛️ para visitas culturales, etc. El itinerario debe comenzar directamente desde Día 1 sin incluir frases de introducción antes del día 1 y añade una justificación de por qué recomiendas cada cosa, el itinerario debe ser muy completo y extenso (con actividades, los monumentos más importantes, la comida típica, costes aproximados, tips de seguridad)."
            },
            {
              role: "user",
              content: `Quiero ir a ${city} ${days} días`,
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Error de API de OpenAI: ${response.statusText}`)
      }

      const data = await response.json()
      const itinerario = data.choices[0].message.content.trim()
      console.log('Itinerario generado con éxito')

      const itinerarioConEspacios = itinerario.replace(/\n/g, '\n\n')

      return new Response(
        JSON.stringify({ result: itinerarioConEspacios }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    } catch (error) {
      console.error('Error en el servidor:', error)
      return new Response(
        JSON.stringify({ error: 'Error interno del servidor' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
  } else {
    return new Response(
      JSON.stringify({ error: 'Método no permitido' }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json", "Allow": "POST" } }
    )
  }
})