import { NextRequest } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest){
  const { url } = await req.json();
  if(!url) return Response.json({ error: 'url missing' }, { status: 400 });
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (JobParser/1.0)' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  const text = $('h1,h2,h3,p,li').map((_,el)=>$(el).text()).get().join('\n').replace(/\n{3,}/g,'\n\n');
  return Response.json({ text });
}
