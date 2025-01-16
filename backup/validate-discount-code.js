import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey);


export async function validateDiscountCode(code) { 
  console.log(`Validando código de descuento: ${code}`); 
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .ilike('code', code)
    .single()

  console.log({data, error});

  if (error || !data) {
    console.error('Error al validar el código de descuento:', error);
    return { id: null, valid: false, percentage: 0 };
  }
  return { id: data.id, valid: true, percentage: data.discount_percentage };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  const { discount_code } = req.body;
  const discount_code_verified = await validateDiscountCode(discount_code);
  return res.status(200).json(discount_code_verified);
}
