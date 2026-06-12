const express = require('express');
const router = express.Router();

// POST /api/cedula/leer
// Recibe { pdf_base64: string } y devuelve { nombres, apellidos, tipo_documento, numero_documento }
router.post('/leer', async (req, res) => {
  const { pdf_base64 } = req.body;

  if (!pdf_base64) {
    return res.status(400).json({ message: 'No se recibió el PDF' });
  }

  try {
    const apiKey = process.env.GEMINI_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inline_data: {
                mime_type: 'application/pdf',
                data: pdf_base64,
              }
            },
            {
              text: `Eres un asistente que extrae datos de cédulas colombianas.
Analiza este documento y extrae ÚNICAMENTE los siguientes campos en formato JSON:
{
  "nombres": "nombres de pila (sin apellidos)",
  "apellidos": "apellidos completos",
  "tipo_documento": "CC" si es cédula de ciudadanía, "TI" si es tarjeta de identidad, "CE" si es cédula de extranjería, "PA" si es pasaporte,
  "numero_documento": "número de documento sin puntos ni espacios"
}
Responde SOLO con el JSON, sin texto adicional ni backticks.`
            }
          ]
        }]
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini error:', err);
      return res.status(502).json({ message: 'Error al consultar la IA' });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const extracted = JSON.parse(text.replace(/```json|```/g, '').trim());

    res.json(extracted);
  } catch (err) {
    console.error('Error en /cedula/leer:', err.message);
    res.status(500).json({ message: 'Error interno al procesar la cédula' });
  }
});

module.exports = router;