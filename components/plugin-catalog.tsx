'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Search, ArrowUpRight } from 'lucide-react';
type Plugin = { name:string; displayName:string; description:string; version:string; source:string; serverCount:number; skillCount:number };
function CommandCopy({command}: {command:string}) {
  const [status,setStatus]=useState('');
  async function copy(){try{await navigator.clipboard.writeText(command);setStatus('Copied');}catch{setStatus('Select and copy the command manually.');}}
  return <div><div className="command-line"><code>{command}</code><button type="button" onClick={copy} aria-label="Copy command">{status==='Copied'?<Check size={15}/>:<Copy size={15}/>}</button></div><span className="sr-only" role="status">{status}</span></div>;
}
export function PluginCatalog({plugins,unavailable}: {plugins:Plugin[];unavailable:boolean}) {
  const [query,setQuery]=useState('');
  const filtered=plugins.filter(p=>`${p.displayName} ${p.description}`.toLowerCase().includes(query.toLowerCase()));
  return <><div className="catalog-connect"><div><strong>Connect the catalog once.</strong><p>Then install the tools your workflow needs.</p></div><CommandCopy command="supercharge plugin catalog configure --url https://www.superchargeai.in/api/plugins/v1"/></div><div className="catalog-toolbar"><label className="catalog-search"><Search size={17}/><span className="sr-only">Search plugins</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a tool or workflow…" type="search"/></label><span className="catalog-count" role="status">{filtered.length} {filtered.length===1?'plugin':'plugins'}</span></div>{unavailable ? <div className="empty-catalog"><h2>The catalog is temporarily unavailable.</h2><p>Please reload to try again. You can still explore how extensions work in the documentation.</p><Link href="/docs/extensions" className="text-button">Extension guide <ArrowUpRight size={15}/></Link></div> : !filtered.length ? <div className="empty-catalog"><h2>{query?'No matching plugins.':'The catalog is getting started.'}</h2><p>{query?'Try a tool name or a broader search.':'Published plugins will appear here. In the meantime, explore MCP servers, skills, and hooks.'}</p>{query?<button type="button" className="button button-secondary" onClick={()=>setQuery('')}>Clear search</button>:<Link className="text-button" href="/docs/extensions">Explore extensions <ArrowUpRight size={15}/></Link>}</div>:<div className="catalog-list">{filtered.map(p=><article className="plugin-card" key={p.name}><h2>{p.displayName}</h2><p>{p.description}</p><div className="plugin-meta"><span>v{p.version.replace(/^v/,'')}</span><span>{p.serverCount} MCP servers</span><span>{p.skillCount} skills</span></div><CommandCopy command={`supercharge plugin install ${p.source} --trust`}/></article>)}</div>}</>;
}
