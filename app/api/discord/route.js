import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req) {
  try {
    const { botToken, channelId, applicantName, applicantEmail, companyName, website, pdfBase64 } =
      await req.json();

    if (!botToken || !channelId) {
      return NextResponse.json({ error: "Bot token and channel ID required" }, { status: 400 });
    }

    const content =
      `**New Company Research Submitted**\n` +
      `Applicant: ${applicantName}\nEmail: ${applicantEmail}\n` +
      `Company: ${companyName}\nWebsite: ${website}`;

    const form = new FormData();
    form.append("payload_json", JSON.stringify({ content }));

    if (pdfBase64) {
      const buffer = Buffer.from(pdfBase64, "base64");
      const blob = new Blob([buffer], { type: "application/pdf" });
      form.append("files[0]", blob, `${companyName || "report"}.pdf`);
    }

    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bot ${botToken}` },
      body: form,
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: "Discord API error", details: errText }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Discord send failed", details: err.message }, { status: 500 });
  }
}