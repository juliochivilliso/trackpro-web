import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query, vehicleContext } = await req.json();

  if (!query?.trim()) {
    return NextResponse.json({ error: "Query requerida" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key no configurada" }, { status: 500 });
  }

  const systemInstruction = `Eres un asistente técnico especializado en mantenimiento vehicular para una empresa de gestión de flotas en República Dominicana.

Contexto del vehículo consultado:
${vehicleContext}

Instrucciones:
- Responde en español, de forma clara y concisa (máximo 6 oraciones)
- Incluye datos técnicos específicos cuando sean relevantes (torques, especificaciones, intervalos)
- Menciona precios en pesos dominicanos (RD$) cuando aplique
- Considera el clima tropical de RD (humedad, calor) en tus recomendaciones
- Si el vehículo tiene códigos DTC activos, priorizalos en tu respuesta
- No inventes información que no esté en el contexto del vehículo
- Sé directo y útil, como un mecánico experto de confianza
- NO uses formato markdown. No uses asteriscos, guiones, ni ningún símbolo de formato. Responde en texto plano únicamente.`;

  const body = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      { role: "user", parts: [{ text: query }] },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("Gemini error:", err);
    let detail = "Error desconocido";
    try { detail = JSON.parse(err)?.error?.message ?? err; } catch { detail = err; }
    return NextResponse.json({ error: `Error Gemini: ${detail}` }, { status: 502 });
  }

  const data = await res.json();
  const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts ?? [];
  const raw = parts.map(p => p.text ?? '').join('') || "Sin respuesta del asistente.";
  const text = raw.replace(/\bundefined\b/g, '');

  return NextResponse.json({ response: text });
}
