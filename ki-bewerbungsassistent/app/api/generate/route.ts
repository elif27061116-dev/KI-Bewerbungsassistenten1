import { NextRequest } from 'next/server';
import { openai } from '@/lib/openai';
import { z } from 'zod';

const Schema = z.object({
  kind: z.enum(['cover','resume','about','interview','ats']),
  cv: z.string().default(''),
  job: z.string().default(''),
  company: z.string().default(''),
  role: z.string().default(''),
  tone: z.string().default('professionell & klar'),
  language: z.enum(['Deutsch','Englisch']).default('Deutsch'),
  achievements: z.string().default(''),
  skills: z.string().default(''),
  jobKeywords: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest){
  const body = await req.json();
  const p = Schema.parse(body);

  const system = `Du bist ein präziser Karriere-Schreibassistent. Schreibe aktiv, mit Zahlen und Wirkung, ohne Floskeln.`;

  const instructions = buildInstructions(p);

  const stream = await openai.responses.stream({
    model: 'gpt-4o-mini',
    input: [
      { role: 'system', content: system },
      { role: 'user', content: instructions }
    ],
    temperature: 0.4,
  });

  return new Response(stream.toReadableStream(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

function buildInstructions(p:any){
  const base = `
Sprache: ${p.language}
Rolle: ${p.role}
Unternehmen: ${p.company}
Ton: ${p.tone}
Erfolge: ${p.achievements}
Skills: ${p.skills}
CV: ${p.cv}
Stellenanzeige: ${p.job}
Keywords: ${(p.jobKeywords||[]).slice(0,20).join(', ')}`;
  switch(p.kind){
    case 'cover': return `Schreibe ein individuelles Anschreiben (200–250 Wörter). ${base}`;
    case 'resume': return `Schreibe nur die Abschnitte Berufserfahrung + Kompetenzen, ATS-optimiert im Bullet-Stil (STAR). ${base}`;
    case 'about': return `Formuliere eine LinkedIn-About-Sektion (80–120 Wörter) mit 3–5 Kernkompetenzen und 2–3 messbaren Erfolgen. ${base}`;
    case 'interview': return `Erzeuge 10 Interviewfragen (3 Fach, 3 Verhalten, 2 Zusammenarbeit, 2 Strategie) und ideale STAR-Antworten. ${base}`;
    case 'ats': return `Gib eine kompakte ATS-Checkliste (Format, Sprache, Keywords, Wirkung, Relevanz, Final Checks). ${base}`;
  }
}
