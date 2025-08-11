# KI-Bewerbungsassistent (Next.js + OpenAI)

## Schnellstart (lokal)
```bash
npm i
# .env.local anlegen:
echo "OPENAI_API_KEY=sk-..." > .env.local
npm run dev
```
Öffne http://localhost:3000

## Deploy zu Vercel (CLI)
```bash
npm i -g vercel
vercel login
vercel
# beim ersten Mal Projekt verlinken, dann:
vercel --prod
```
Setze auf Vercel im Projekt-Panel die Umgebungsvariable `OPENAI_API_KEY`.
