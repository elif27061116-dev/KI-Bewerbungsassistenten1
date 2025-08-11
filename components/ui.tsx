import React from 'react';
import clsx from 'clsx';
export function Card(p:{className?:string,children:React.ReactNode}){
  return <div className={clsx('rounded-2xl bg-white shadow-sm border border-slate-200', p.className)}>{p.children}</div>
}
export function Button(p:{children:React.ReactNode,onClick?:()=>void,type?:'button'|'submit',variant?:'primary'|'secondary'|'ghost',className?:string,disabled?:boolean}){
  const base='inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium';
  const v=p.variant==='secondary'?'bg-slate-100 hover:bg-slate-200':p.variant==='ghost'?'hover:bg-slate-100':'bg-slate-900 text-white hover:bg-black';
  return <button type={p.type||'button'} disabled={p.disabled} onClick={p.onClick} className={clsx(base,v,p.className, p.disabled&&'opacity-50 cursor-not-allowed')}>{p.children}</button>
}
export function Textarea(p:{value?:string,onChange?:(e:any)=>void,rows?:number,placeholder?:string,className?:string}){
  return <textarea value={p.value} onChange={p.onChange} rows={p.rows||6} placeholder={p.placeholder} className={clsx('w-full resize-y rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white',p.className)} />
}
export function Input(p:{value?:string,onChange?:(e:any)=>void,placeholder?:string,className?:string}){
  return <input value={p.value} onChange={p.onChange} placeholder={p.placeholder} className={clsx('w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white',p.className)} />
}
export function Badge(p:{children:React.ReactNode,variant?:'outline'|'solid'}){
  const c=p.variant==='outline'?'border border-slate-300 text-slate-700':'bg-slate-100 text-slate-800';
  return <span className={clsx('px-2 py-1 rounded-lg text-xs',c)}>{p.children}</span>
}
