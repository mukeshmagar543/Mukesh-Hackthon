import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function analyzeCompany({ companyName, crawledContent, model, apiKey }) {
  const selectedModel = model || "meta-llama/llama-3.3-70b-instruct:free";

  const prompt = `
You are a business research analyst. Based on the data below about "${companyName}", return ONLY valid JSON (no markdown, no backticks) with this exact structure:

{
  "companyName": "",
  "website": "",
  "phone": "",
  "address": "",
  "productsServices": "",
  "painPoints": "",
  "summary": "",
  "industry": "",
  "competitors": [{"name": "", "website": ""}]
}

WEBSITE CONTENT:
${crawledContent.slice(0, 6000)}

Rules:
- If a field is unknown, use "Not available".
- painPoints must be 3-4 realistic business pain points inferred from their products/industry.
- Return raw JSON only, nothing else.
`;

  const res = await axios.post(
    OPENROUTER_URL,
    {
      model: selectedModel,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey || process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": "Company Research Assistant",
      },
      timeout: 30000,
    }
  );

  const raw = res.data.choices[0].message.content.trim();
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return { summary: raw, productsServices: "Not available", painPoints: "Not available" };
  }
}