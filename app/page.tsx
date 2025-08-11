'use client'
import React, { useMemo, useState } from 'react';
import { Bot, Download, FileText, Wand2, ClipboardList, Sparkles, Search, FileUp } from 'lucide-react';
import { Button, Card, Input, Textarea, Badge } from '@/components/ui';

export default function Page(){
  const [cv, setCv] = useState('');
  const [job, setJob] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Qualitätsmanager (m/w/d)');
  const [tone, setTone] = useState('professionell & klar');
  const [language, setLanguage] = useState<'Deutsch'|'Englisch'>('Deutsch');
  const [achievements, setAchievements] = useState('Ausschussquote −32% in 6 Monaten durch SPC-Einführung; Audit-Score +15 Punkte.');
  const [skills, setSkills] = useState('IATF 16949, FMEA, MSA, PPAP, Python, Power BI');
  const [loading, setLoading] = useState<null | 'cover' | 'resume' | 'about' | 'interview' | 'ats'>(null);
  const [result, setResult] = useState('');

  const jobKw = useMemo(()=> topKeywords(job), [job]);
  const cvKw = useMemo(()=> topKeywords(cv), [cv]);
  const match = useMemo(()=> Math.round(100 * overlap(cvKw, jobKw).length / Math.max(1, jobKw.length)),[cvKw, jobKw]);

  const doGen = async(kind: 'cover'|'resume'|'about'|'interview'|'ats')=>{
    try{
      setLoading(kind); setResult('');
      const r = await fetch('/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ kind, cv, job, company, role, tone, language, achievements, skills, jobKeywords: jobKw }) });
      if(!r.ok) throw new Error(await r.text());
      const reader = r.body!.getReader();
      const dec = new TextDecoder();
      let buf='';
      while(true){
        const {done, value} = await reader.read();
        if(done) break; buf += dec.decode(value); setResult(buf);
      }
    }catch(e:any){
      setResult('Fehler: '+e?.message);
    }finally{ setLoading(null); }
  };

  const exportPdf = async()=>{
    const r = await fetch('/api/pdf', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ company, role, content: result || buildSummary({company,role,cv,job,language}) }) });
    if(!r.ok){ alert('PDF Fehler'); return; }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`bewerbung-${Date.now()}.pdf`; a.click(); URL.revokeObjectURL(url);
  };

  const parseUrl = async()=>{
    const url = prompt('URL der Stellenanzeige eingeben');
    if(!url) return;
    const r = await fetch('/api/parse', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ url }) });
    const j = await r.json();
    if(j.text){ setJob(j.text.slice(0, 6000)); }
  };

  return (
    <main className="mx-auto max-w-6xl p-6 grid gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">KI-Bewerbungsassistent</h1>
          <p className="text-slate-600 mt-1">Next.js + OpenAI Responses API · ATS-Analyse · PDF-Export · URL-Parser</p>
        </div>
        <Badge>Beta</Badge>
      </header>

      <Card className="p-4 md:p-6 grid md:grid-cols-2 gap-4">
        <section className="grid gap-3">
          <label className="text-sm font-medium">Zielrolle</label>
          <Input value={role} onChange={(e:any)=>setRole(e.target.value)} placeholder="z. B. Qualitätsmanager (m/w/d)" />
          <label className="text-sm font-medium">Unternehmen</label>
          <Input value={company} onChange={(e:any)=>setCompany(e.target.value)} placeholder="Firmenname" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Ton</label>
              <Input value={tone} onChange={(e:any)=>setTone(e.target.value)} placeholder="professionell & klar" />
            </div>
            <div>
              <label className="text-sm font-medium">Sprache</label>
              <div className="flex gap-2">
                <Button variant={language==='Deutsch'?'primary':'secondary'} onClick={()=>setLanguage('Deutsch')}>Deutsch</Button>
                <Button variant={language==='Englisch'?'primary':'secondary'} onClick={()=>setLanguage('Englisch')}>Englisch</Button>
              </div>
            </div>
          </div>
        </section>
        <section className="grid gap-3">
          <label className="text-sm font-medium flex items-center gap-2"><FileUp size={16}/>Stellenanzeige importieren</label>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={parseUrl}><Search size={16}/> Aus URL parsen</Button>
            <Button variant="ghost" onClick={()=>navigator.clipboard.readText().then(t=>setJob(t))}>Aus Zwischenablage</Button>
          </div>
          <label className="text-sm font-medium">Erfolge & Kern-Skills</label>
          <Textarea value={achievements} onChange={(e:any)=>setAchievements(e.target.value)} rows={3} />
          <Textarea value={skills} onChange={(e:any)=>setSkills(e.target.value)} rows={2} />
        </section>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4 md:p-6 grid gap-2">
          <label className="text-sm font-medium">CV / Profil</label>
          <Textarea value={cv} onChange={(e:any)=>setCv(e.target.value)} rows={14} />
        </Card>
        <Card className="p-4 md:p-6 grid gap-2">
          <label className="text-sm font-medium">Stellenanzeige</label>
          <Textarea value={job} onChange={(e:any)=>setJob(e.target.value)} rows={14} />
        </Card>
      </div>

      <Card className="p-4 md:p-6 grid md:grid-cols-3 gap-6 items-start">
        <div>
          <h3 className="font-semibold mb-2">ATS-Match</h3>
          <div className="text-4xl font-semibold">{match}<span className="text-xl">%</span></div>
          <p className="text-sm text-slate-600 mt-1">Heuristik: Überschneidung der Top-Keywords.</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Treffer</h4>
          <div className="flex flex-wrap gap-1">{overlap(cvKw, jobKw).slice(0,20).map(k=> <Badge key={k}>{k}</Badge>)}</div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Lücken</h4>
          <div className="flex flex-wrap gap-1">{diff(jobKw, cvKw).slice(0,20).map(k=> <Badge key={k} variant="outline">{k}</Badge>)}</div>
        </div>
      </Card>

      <div className="grid 2xl:grid-cols-2 gap-6">
        <ToolCard title="Anschreiben generieren" icon={<Wand2 size={16}/>} onClick={()=>doGen('cover')} loading={loading==='cover'} />
        <ToolCard title="CV-Rewrite (ATS)" icon={<FileText size={16}/>} onClick={()=>doGen('resume')} loading={loading==='resume'} />
        <ToolCard title="LinkedIn About" icon={<Sparkles size={16}/>} onClick={()=>doGen('about')} loading={loading==='about'} />
        <ToolCard title="Interview: Fragen + STAR-Antworten" icon={<Bot size={16}/>} onClick={()=>doGen('interview')} loading={loading==='interview'} />
        <ToolCard title="ATS-Checkliste" icon={<ClipboardList size={16}/>} onClick={()=>doGen('ats')} loading={loading==='ats'} />
      </div>

      <Card className="p-4 md:p-6 grid gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Ergebnis</h3>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={()=>navigator.clipboard.writeText(result)}><Download size={16}/>Kopieren</Button>
            <Button onClick={exportPdf}><Download size={16}/>Als PDF</Button>
          </div>
        </div>
        <pre className="whitespace-pre-wrap text-sm leading-6">{result || '← Wähle ein Tool oben aus.'}</pre>
      </Card>
    </main>
  );
}

function topKeywords(text:string){
  const stop = new Set(['und','oder','der','die','das','ein','eine','ist','sind','mit','für','im','in','auf','an','zu','vom','von','am','aus','bei','den','des','dem','dass','wie','als','auch','ich','wir','ihr','sie','the','a','an','of','to','for','on','in','at','by','and','or','be','are','was','were','it','that']);
  return Array.from(new Set((text||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9äöüß\s]/g,' ').split(/\s+/).filter(w=>w.length>2 && !stop.has(w)))).slice(0,60);
}
function overlap(a:string[], b:string[]){ const sb=new Set(b); return a.filter(x=>sb.has(x)); }
function diff(a:string[], b:string[]){ const sb=new Set(b); return a.filter(x=>!sb.has(x)); }
function buildSummary({company,role,cv,job,language}:{company:string,role:string,cv:string,job:string,language:string}){
  return `${language==='Deutsch'?'Zusammenfassung':'Summary'}\n\nPosition: ${role} – ${company}\n\nKandidat (Auszug):\n${cv.slice(0,1200)}\n\nStellenanzeige (Auszug):\n${job.slice(0,1200)}`
}
function ToolCard({title,icon,onClick,loading}:{title:string,icon:any,onClick:()=>void,loading:boolean}){
  return (
    <Card className="p-4 md:p-6 flex items-center justify-between">
      <div className="flex items-center gap-2"><div className="p-2 rounded-xl bg-slate-100">{icon}</div><div className="font-medium">{title}</div></div>
      <Button onClick={onClick} disabled={loading}>{loading?'…generiert':'Erstellen'}</Button>
    </Card>
  );
}
