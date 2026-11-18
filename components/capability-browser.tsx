'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Search, Terminal, X, Plus } from 'lucide-react';
import { capabilities } from './home-content';

const groups = [
  { name: 'Everyday work', indices: [0, 5, 7, 9] },
  { name: 'Configuration', indices: [1, 2, 6, 8, 10] },
  { name: 'Integrations', indices: [3, 4] },
];
export function CapabilityBrowser() {
  const [query,setQuery]=useState('');
  const [active,setActive]=useState(0);
  const buttons=useRef<(HTMLButtonElement|null)[]>([]);
  const matches=groups.flatMap(g=>g.indices).filter(i=>`${capabilities[i].title} ${capabilities[i].detail} ${capabilities[i].command}`.toLowerCase().includes(query.toLowerCase().trim()));
  const selected=matches.includes(active)?active:matches[0];
  const item=selected===undefined?null:capabilities[selected];
  return <section className="command-section wrap" id="capabilities" aria-labelledby="commands-title">
    <details className="capability-disclosure"><summary><div><span className="quiet-label">For the terminal curious</span><h2 id="commands-title">Explore the CLI toolkit</h2><p>Find a command for sessions, providers, permissions, and more.</p></div><Plus size={22}/></summary>
    <div className="command-browser"><div className="command-sidebar"><label className="command-search"><Search size={16}/><input type="search" placeholder="Find a capability…" aria-label="Find a capability" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button type="button" onClick={()=>setQuery('')} aria-label="Clear capability search"><X size={14}/></button>}</label>
    <div className="command-list" role="tablist" aria-label="CLI capabilities" aria-orientation="vertical" onKeyDown={e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key)||!matches.length)return;e.preventDefault();const current=matches.indexOf(selected);const next=e.key==='Home'?matches[0]:e.key==='End'?matches[matches.length-1]:matches[(current+(e.key==='ArrowDown'?1:matches.length-1))%matches.length];setActive(next);buttons.current[next]?.focus();}}>
    {groups.map(group=>{const visible=group.indices.filter(i=>matches.includes(i));return visible.length?<div className="command-group" key={group.name} role="presentation"><span aria-hidden="true">{group.name}</span>{visible.map(i=><button type="button" role="tab" id={`command-tab-${i}`} aria-selected={selected===i} aria-controls="command-panel" tabIndex={selected===i?0:-1} key={i} ref={n=>{buttons.current[i]=n;}} onClick={()=>setActive(i)}>{capabilities[i].title}<ArrowRight size={14}/></button>)}</div>:null;})}</div>
    {!matches.length&&<p className="command-empty" role="status">No matches for “{query}”.<button type="button" onClick={()=>setQuery('')}>Show all capabilities</button></p>}</div>
    {item?<div className="command-panel" id="command-panel" role="tabpanel" aria-labelledby={`command-tab-${selected}`} tabIndex={0}><div className="command-panel-top"><Terminal size={17}/><span>supercharge / CLI</span><span>{String(selected+1).padStart(2,'0')}</span></div><div className="command-panel-body"><span className="quiet-label">{groups.find(g=>g.indices.includes(selected))?.name}</span><h3>{item.title}</h3><p>{item.detail}</p><div className="command-code"><span>Command / configuration</span><code>{item.command}</code></div><Link href={item.href}>Read the documentation <ArrowUpRight size={16}/></Link></div><div className="command-panel-bottom">Runs from your terminal. Works with your repository.</div></div>:<div className="command-panel command-no-selection"><Search size={26}/><h3>Try another search.</h3><p>Search for a task, feature, or command.</p></div>}
    </div><div className="command-after"><span>Already know your way around?</span><Link href="/docs/slash">Browse the command reference <ArrowUpRight size={14}/></Link></div>
  </details></section>;
}
