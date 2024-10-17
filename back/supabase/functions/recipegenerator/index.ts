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
      const { ingredients } = await req.json()
      console.log('Datos recibidos:', { ingredients })

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
              content: "Eres un creador de recetas y con los ingredientes que recibas debes crear una receta adecuada a esos ingredientes. Cuando proporciones recetas, incluye emoticonos apropiados junto a cada elemento para hacerlo más visual y atractivo. Por ejemplo, usa ⏰ para horarios, 🍽️ para comidas, etc. La receta debe comenzar directamente sin incluir frases de introducción."
            },
            {
              role: "user",
              content: `Quiero una receta con ${ingredients} ingredientes`,
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Error de API de OpenAI: ${response.statusText}`)
      }

      const data = await response.json()
      const recipe = data.choices[0].message.content.trim()
      console.log('Receta generada con éxito')

      const recipeConEspacios = recipe.replace(/\n/g, '\n\n')

      return new Response(
        JSON.stringify({ result: recipeConEspacios }),
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