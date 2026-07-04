import { NextResponse } from "next/server";
import { findOfficialWebsite, findCompetitors } from "@/lib/serper";
import { crawlWebsite } from "@/lib/crawler";
import { analyzeCompany } from "@/lib/openrouter";
import { generatePDFBuffer } from "@/lib/pdf";

export const maxDuration = 60;

function isUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req) {
  try {
    const { input, model, openrouterKey, serperKey } = await req.json();
    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    let website = input.trim();
    let companyName = input.trim();

    if (!isUrl(website)) {
      let found;
      try {
        found = await findOfficialWebsite(website, serperKey);
      } catch (e) {
        throw new Error(`[SERPER-findOfficialWebsite] ${e.response?.status || ""} ${e.message}`);
      }
      if (!found) {
        return NextResponse.json({ error: "Could not find official website" }, { status: 404 });
      }
      website = found;
    } else {
      companyName = new URL(website).hostname.replace("www.", "").split(".")[0];
    }

    const crawledPages = await crawlWebsite(website, 6);
    const crawledContent = crawledPages.map((p) => `URL: ${p.url}\n${p.text}`).join("\n\n");

    let analysis;
    try {
      analysis = await analyzeCompany({ companyName, crawledContent, model, apiKey: openrouterKey });
    } catch (e) {
      throw new Error(`[OPENROUTER-analyzeCompany] ${e.response?.status || ""} ${e.message} | ${JSON.stringify(e.response?.data || {})}`);
    }

    // ---- REPLACED BLOCK STARTS HERE ----
    let competitors = analysis.competitors && analysis.competitors.length > 0
      ? analysis.competitors
      : [];

    if (competitors.length === 0) {
      try {
        competitors = await findCompetitors(analysis.companyName || companyName, analysis.industry, serperKey);
      } catch (e) {
        competitors = [];
      }
    }
    // ---- REPLACED BLOCK ENDS HERE ----

    const reportData = {
      companyName: analysis.companyName || companyName,
      website: analysis.website || website,
      phone: analysis.phone || "Not available",
      address: analysis.address || "Not available",
      productsServices: analysis.productsServices || "Not available",
      painPoints: analysis.painPoints || "Not available",
      summary: analysis.summary || "",
      competitors,
    };

    const pdfBuffer = await generatePDFBuffer(reportData);

    return NextResponse.json({ ...reportData, pdfBase64: pdfBuffer.toString("base64") });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Research failed", details: err.message }, { status: 500 });
  }
}