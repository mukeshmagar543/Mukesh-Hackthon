import axios from "axios";
import * as cheerio from "cheerio";

const TARGET_KEYWORDS = ["about", "product", "service", "solution", "contact", "pricing"];
const IGNORE_KEYWORDS = ["login", "signin", "sign-in", "signup", "register", "cart", "checkout"];

async function fetchPage(url) {
  try {
    const res = await axios.get(url, {
      timeout: 8000,
      headers: { "User-Agent": "Mozilla/5.0 (CompanyResearchBot)" },
      maxRedirects: 5,
    });
    return res.data;
  } catch {
    return null;
  }
}

function extractText($) {
  $("script, style, noscript, svg").remove();
  return $("body").text().replace(/\s+/g, " ").trim().slice(0, 4000);
}

function extractLinks($, baseUrl) {
  const links = new Set();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    try {
      const abs = new URL(href, baseUrl).href.split("#")[0];
      const lower = abs.toLowerCase();
      if (IGNORE_KEYWORDS.some((k) => lower.includes(k))) return;
      if (new URL(abs).hostname !== new URL(baseUrl).hostname) return;
      links.add(abs);
    } catch {}
  });
  return Array.from(links);
}

export async function crawlWebsite(startUrl, maxPages = 6) {
  const visited = new Set();
  const pagesData = [];

  const homeHtml = await fetchPage(startUrl);
  if (!homeHtml) return pagesData;

  const $home = cheerio.load(homeHtml);
  visited.add(startUrl);
  pagesData.push({ url: startUrl, text: extractText($home) });

  const allLinks = extractLinks($home, startUrl);
  const priorityLinks = allLinks.filter((link) =>
    TARGET_KEYWORDS.some((k) => link.toLowerCase().includes(k))
  );

  for (const link of priorityLinks.slice(0, maxPages - 1)) {
    if (visited.has(link)) continue;
    visited.add(link);
    const html = await fetchPage(link);
    if (!html) continue;
    const $ = cheerio.load(html);
    pagesData.push({ url: link, text: extractText($) });
    if (pagesData.length >= maxPages) break;
  }

  return pagesData;
}