import axios from "axios";

const SERPER_URL = "https://google.serper.dev/search";

async function serperSearch(query, apiKey) {
  const res = await axios.post(
    SERPER_URL,
    { q: query },
    {
      headers: {
        "X-API-KEY": apiKey || process.env.SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );
  return res.data;
}

export async function findOfficialWebsite(companyName, apiKey) {
  const data = await serperSearch(`${companyName} official website`, apiKey);
  const organic = data.organic || [];
  return organic.length > 0 ? organic[0].link : null;
}

export async function findCompetitors(companyName, industry, apiKey) {
  const data = await serperSearch(`${companyName} top competitors ${industry || ""}`, apiKey);
  return (data.organic || []).slice(0, 5).map((r) => ({
    name: r.title,
    website: r.link,
  }));
}