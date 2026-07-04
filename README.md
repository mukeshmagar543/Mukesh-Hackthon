# Company Research Assistant

AI-powered company research tool: crawls a company's website, enriches with Serper.dev search,
analyzes with an OpenRouter AI model, finds competitors, and generates a downloadable PDF report.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and add your keys:
   - `SERPER_API_KEY` — from https://serper.dev (free tier, 2500 queries)
   - `OPENROUTER_API_KEY` — from https://openrouter.ai (use a `:free` model, no card needed)
3. `npm run dev` → open http://localhost:3000

## Environment Variables
| Variable | Description |
|---|---|
| SERPER_API_KEY | API key for Serper.dev search |
| OPENROUTER_API_KEY | API key for OpenRouter AI |
| SITE_URL | Public URL of your deployment (used in OpenRouter headers) |

## Deployment (Vercel)
1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the same env vars in Vercel → Settings → Environment Variables.
4. Deploy.

## Discord Bonus
Open "Discord Settings" in the UI, paste the bot token + channel ID + applicant name/email.
After every successful research report, the PDF and details are auto-posted to that channel.