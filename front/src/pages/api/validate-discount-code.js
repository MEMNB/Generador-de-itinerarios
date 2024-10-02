const VALID_DISCOUNT_CODE = 'DESCUENTO50'; // Cambia esto por tu código deseado

// Función para validar el código de descuento
function check_discount_code(code) {
  return {valid: code === VALID_DISCOUNT_CODE, percentage: 50};
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  const { discount_code } = req.body;
  const discount_code_verified = check_discount_code(discount_code);
  return res.status(200).json(discount_code_verified);
}
