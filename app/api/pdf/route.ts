import { NextRequest } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function POST(req: NextRequest){
  const { company, role, content } = await req.json();
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const margin = 50;

  page.drawText(`Bewerbung – ${role}${company?` @ ${company}`:''}`, { x: margin, y: height - margin - 20, size: 18, font, color: rgb(0.1,0.1,0.1) });

  const text = (content||'').replace(/\r/g,'');
  const lines = wrap(text, 80);
  let y = height - margin - 60;
  for (const line of lines){
    if (y < margin){ 
      const newPage = pdf.addPage([595.28, 841.89]);
      y = 841.89 - margin;
      newPage.drawText(line, { x: margin, y, size: 11, font, color: rgb(0,0,0) });
      y -= 14;
    } else {
      page.drawText(line, { x: margin, y, size: 11, font, color: rgb(0,0,0) });
      y -= 14;
    }
  }

  const bytes = await pdf.save();
  return new Response(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="bewerbung.pdf"' } });
}

function wrap(text:string, width:number){
  const words=text.split(/\s+/); const lines:string[]=[]; let line='';
  for(const w of words){ if((line+w).length>width){ lines.push(line.trim()); line=w+' '; } else { line+=w+' '; } }
  if(line.trim()) lines.push(line.trim()); return lines;
}
