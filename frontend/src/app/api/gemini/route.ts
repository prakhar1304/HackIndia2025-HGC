export const dynamic = "force-dynamic";

type GeminiCompareRequest = {
  ids: [string, string];
  titles?: { movie1?: string; movie2?: string };
  compareData: any;
  narrative: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GeminiCompareRequest;
    const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const prompt = `You are an expert movie comparison assistant. You will receive two inputs: (1) a structured comparison payload from our engine (compareData), and (2) a narrative explanation (narrative). Your task: produce a single JSON object ONLY (no prose), strictly matching this schema. Keep responses VERY SHORT and punchy. Each bullet must be ≤ 12 words. Use at most 6 headToHead items. 2–4 bullets for strengths/weaknesses.:

{
  "schemaVersion": "1",
  "overview": string,
  "headToHead": [
    { "criterion": string, "winner": "movie1" | "movie2" | "tie", "reason": string }
  ],
  "strengths": { "movie1": string[], "movie2": string[] },
  "weaknesses": { "movie1": string[], "movie2": string[] },
  "suitability": { "audiences": string[], "contentWarnings": string[] },
  "recommendedIf": { "movie1": string[], "movie2": string[] },
  "verdict": { "winner": "movie1" | "movie2" | "depends", "summary": string }
}

Rules:
- Use the keys exactly as shown.
- Fill concise bullet-like strings; avoid long paragraphs.
- Be neutral and evidence-based.
- Prefer consistent criteria like Story, Pacing, Visuals, Acting, Music, Rewatchability, Cultural Impact when possible.
- If information is missing, infer lightly or omit that criterion.
- Output ONLY JSON, no code fences, no comments.`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${prompt}\n\nTITLES: ${JSON.stringify(body.titles || {})}\nCOMPARE_DATA: ${JSON.stringify(
                body.compareData
              )}\nNARRATIVE: ${JSON.stringify(body.narrative)}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        maxOutputTokens: 1024,
      },
    } as const;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(
        JSON.stringify({ error: "Gemini request failed", details: errText }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // attempt to extract largest balanced JSON
      const start = text.indexOf("{");
      if (start >= 0) {
        let depth = 0;
        for (let i = start; i < text.length; i++) {
          const ch = text[i];
          if (ch === "{") depth++;
          else if (ch === "}") {
            depth--;
            if (depth === 0) {
              try {
                parsed = JSON.parse(text.slice(start, i + 1));
              } catch {}
              break;
            }
          }
        }
      }
    }

    if (!parsed) {
      return new Response(
        JSON.stringify({ error: "Failed to parse Gemini response", raw: text }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ result: parsed }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: "Server error", details: String(e?.message || e) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}


