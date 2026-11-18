'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, ChevronRight } from 'lucide-react';

const controls = [
  {name:'Agent modes',title:'Choose how to work.',description:'Make a change, work through a plan, or understand an unfamiliar codebase. Switch modes as the task changes.',href:'/docs/agents',rows:[['Agent','Read files, edit code, and run commands.'],['Plan','Think through an approach before making changes.'],['Ask','Explore your repository and ask questions.']]},
  {name:'Model providers',title:'Bring the model you prefer.',description:'Connect your own API key and endpoint. Your provider handles model usage; Supercharge has no credit balance.',href:'/docs/setup',rows:[['Chat Completions','Connect a compatible provider endpoint.'],['Anthropic Messages','Use the Messages API format.'],['OpenAI Responses','Use the Responses API format.']]},
  {name:'Permissions',title:'Keep the decisions yours.',description:'Choose when tools need approval. Add project rules and extend your workspace as your workflow grows.',href:'/docs/permissions',rows:[['Tool approvals','Review actions before they run.'],['Allow / deny rules','Set boundaries for shell and file tools.'],['MCP & skills','Connect the tools your work needs.']]},
];
export function WorkspaceControls(){
  const [active,setActive]=useState(0);
  const tabs=useRef<(HTMLButtonElement|null)[]>([]);
  const item=controls[active];
  return <section className="workspace-controls wrap" aria-labelledby="control-title">
    <header><span className="quiet-label">Make it yours</span><h2 id="control-title">Your workflow.<br/>Your call.</h2><p>Start with your repository.<br/>Set up the agent around the way you work.</p></header>
    <div className="control-content"><div className="control-tabs" role="tablist" aria-label="Workspace settings" onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?2:(active+(e.key==='ArrowRight'?1:2))%3;setActive(n);tabs.current[n]?.focus();}}>{controls.map((c,i)=><button key={c.name} ref={n=>{tabs.current[i]=n;}} role="tab" id={`control-tab-${i}`} aria-selected={active===i} aria-controls="control-panel" tabIndex={active===i?0:-1} onClick={()=>setActive(i)}>{c.name}</button>)}</div>
    <div role="tabpanel" id="control-panel" aria-labelledby={`control-tab-${active}`} tabIndex={0}><h3>{item.title}</h3><p>{item.description}</p><dl>{item.rows.map(([name,description])=><div key={name}><dt><Check size={15}/>{name}</dt><dd>{description}</dd></div>)}</dl><Link href={item.href}>Read the guide <ArrowUpRight size={15}/></Link></div><div className="control-footnote"><ChevronRight size={14}/><code>/setup</code><span>Start configuring from your terminal.</span></div></div>
  </section>;
}
