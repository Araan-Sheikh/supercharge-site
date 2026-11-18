'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Download, Pause, Play, X, Monitor, Terminal, Smartphone } from 'lucide-react';

const surfaces = [
  {name:'Studio',icon:Monitor,src:'/studio-desktop.png',alt:'Supercharge Studio with project sidebar, agent conversation, terminal and browser',note:'The full workspace. Agent, terminal, and browser together.',link:'/download',label:'Download Studio'},
  {name:'CLI',icon:Terminal,src:'/walkthrough-poster.webp',alt:'Actual Supercharge terminal session exploring a codebase',note:'Start in a repository. Work directly from your terminal.',link:'/docs/install',label:'Install the CLI'},
  {name:'Android',icon:Smartphone,src:'/studio-phone-chat.png',alt:'Actual Supercharge Android conversation',note:'Pair with Studio on your computer and follow the conversation.',link:'/download#mobile',label:'Get Android'},
];
export function StudioHero() {
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [surface, setSurface] = useState(0);
  const surfaceTabs = useRef<(HTMLButtonElement|null)[]>([]);
  const current = surfaces[surface];
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if(root.current) root.current.dataset.visible = String(entry.isIntersecting); });
    if(root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  return <section ref={root} className="launch-hero" id="workspace" aria-labelledby="sc-title" data-paused={paused}>
    <div className="launch-intro">
      <span className="launch-eyebrow">SUPERCHARGE STUDIO + CLI</span>
      <h1 id="sc-title">From your first prompt<br/>to your next commit.</h1>
      <p>An AI coding workspace for your repository.<br/>Your agent, terminal, and browser—all together.</p>
      <div className="launch-actions"><Link href="/download"><Download size={17}/>Download Studio</Link><Link href="/docs/install">Explore the CLI <ArrowRight size={17}/></Link></div>
      <span className="launch-platforms">macOS, Windows & Linux · Free to use · Bring your own model</span>
    </div>
    <div className="launch-scene" onPointerMove={event=>{if(paused || event.pointerType==='touch' || matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty('--tilt',`${((event.clientX-r.left)/r.width-.5)*3}deg`);}} onPointerLeave={event=>event.currentTarget.style.setProperty('--tilt','0deg')}>

      <div className="orbital-form form-blue" aria-hidden="true"/><div className="orbital-form form-violet" aria-hidden="true"/><div className="orbital-form form-silver" aria-hidden="true"/>
      <div className="launch-mascot" aria-hidden="true"><span/><img src="/logo.png" width="120" height="120" alt=""/></div>
      <div className="launch-product-preview">
        <div className="preview-tabs" role="tablist" aria-label="Explore product surfaces" onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?2:(surface+(e.key==='ArrowRight'?1:2))%3;setSurface(next);surfaceTabs.current[next]?.focus();}}>{surfaces.map((item,i)=><button type="button" key={item.name} ref={n=>{surfaceTabs.current[i]=n;}} role="tab" id={`preview-tab-${i}`} aria-selected={surface===i} aria-controls="preview-panel" tabIndex={surface===i?0:-1} onClick={()=>setSurface(i)}><item.icon size={15}/>{item.name}</button>)}</div>
        <div id="preview-panel" role="tabpanel" aria-labelledby={`preview-tab-${surface}`}>
          <button ref={opener} type="button" className={`launch-window preview-surface-${surface}`} onClick={()=>dialog.current?.showModal()} aria-label={`Enlarge ${current.name} screenshot`}><span className="launch-window-bar"><span>● ● ●</span><span>Supercharge / {current.name}</span><span>View full size ↗</span></span><span className="preview-image-area"><img src={current.src} width={surface===2?420:1920} height={surface===2?850:1044} alt={current.alt} fetchPriority={surface===0?'high':'auto'}/>{surface===2&&<span className="preview-phone-note"><Smartphone size={28}/><strong>Your workspace,<br/>within reach.</strong><span>Conversations · History · Projects</span></span>}</span></button>
          <div className="launch-preview-caption"><span>{current.note}</span><Link href={current.link}>{current.label} <ArrowRight size={14}/></Link></div>
        </div>
      </div>
    </div>
    <div className="launch-under"><a href="#walkthrough">Watch a real session <Play size={12}/></a><button type="button" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?<Play size={13}/>:<Pause size={13}/>}<span>{paused?'Resume motion':'Pause motion'}</span></button></div>
    <dialog ref={dialog} className="sc-image-dialog" aria-label={`Full ${current.name} screenshot`} onClose={()=>opener.current?.focus()} onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}><div><button type="button" autoFocus onClick={()=>dialog.current?.close()} aria-label="Close screenshot"><X size={22}/></button><img src={current.src} width={surface===2?420:1920} height={surface===2?850:1044} alt={current.alt}/></div></dialog>
  </section>;
}
