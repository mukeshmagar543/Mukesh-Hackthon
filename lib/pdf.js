import PDFDocument from "pdfkit";

const ORANGE = "#f5a623";
const DARK = "#0f1117";
const TEXT = "#1f2937";

export function generatePDFBuffer(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: "A4" });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const marginX = 50;

    // Header band
    doc.rect(0, 0, pageWidth, 110).fill(DARK);
    doc.fillColor(ORANGE).fontSize(10).text(
      "RELU CONSULTANCY  ·  COMPANY RESEARCH REPORT",
      marginX,
      35
    );
    doc.fillColor("#ffffff").fontSize(26).text(data.companyName || "Unknown Company", marginX, 55);
    doc.rect(0, 110, pageWidth, 4).fill(ORANGE);

    let y = 145;

    function sectionHeader(title) {
      doc.fillColor(ORANGE).fontSize(12).text(title.toUpperCase(), marginX, y);
      y += 16;
      doc.moveTo(marginX, y).lineTo(pageWidth - marginX, y).strokeColor("#e5e7eb").stroke();
      y += 12;
    }

    function row(label, value) {
      doc.fillColor("#6b7280").fontSize(10).text(label, marginX, y, { continued: false });
      doc.fillColor(TEXT).fontSize(11).text(value || "Not available", marginX + 110, y);
      y += 20;
    }

    sectionHeader("Company Information");
    row("Website", data.website);
    row("Phone", data.phone);
    row("Address", data.address);
    y += 8;

    sectionHeader("Products & Services");
    doc.fillColor(TEXT).fontSize(11).text(data.productsServices || "Not available", marginX, y, {
      width: pageWidth - marginX * 2,
    });
    y = doc.y + 16;

    sectionHeader("AI-Generated Pain Points");
    doc.fillColor(TEXT).fontSize(11).text(data.painPoints || "Not available", marginX, y, {
      width: pageWidth - marginX * 2,
    });
    y = doc.y + 16;

    sectionHeader("Competitors");
    (data.competitors || []).forEach((c) => {
      doc.fillColor(TEXT).fontSize(11).text(c.name, marginX, y, { continued: false });
      doc.fillColor("#2563eb").fontSize(10).text(c.website, marginX + 150, y);
      y += 18;
    });

    doc.end();
  });
}