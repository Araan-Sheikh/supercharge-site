'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Layers, RotateCcw } from 'lucide-react';

export function WorkspaceOrbit() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [assembled, setAssembled] = useState<boolean | null>(null);
  useEffect(()=>{
    const node=root.current;
    if(!node) return;
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0;
    const update=()=>{frame=0;const r=node.getBoundingClientRect();const p=motion.matches||innerWidth<=600?0:Math.max(0,Math.min(1,(innerHeight*.4-r.top)/(r.height*.65)));node.style.setProperty('--assembly',String(p));};
    const scroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
    update();window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);motion.addEventListener('change',update);
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);motion.removeEventListener('change',update);};
  },[]);
  const paint=(img:HTMLImageElement)=>{
    const c=canvas.current; if(!c)return;
    const sample=document.createElement('canvas');sample.width=110;sample.height=110;
    const s=sample.getContext('2d',{willReadFrequently:true}),ctx=c.getContext('2d');if(!s||!ctx)return;
    s.drawImage(img,0,0,110,110);const d=s.getImageData(0,0,110,110).data;c.width=660;c.height=660;ctx.clearRect(0,0,660,660);
    for(let y=0;y<110;y++)for(let x=0;x<110;x++){const i=(y*110+x)*4;if(d[i+3]<40)continue;const l=(d[i]+d[i+1]+d[i+2])/765;ctx.fillStyle=`rgba(145,126,218,${.45+l*.55})`;ctx.beginPath();ctx.arc(x*6,y*6,1+l*1.5,0,Math.PI*2);ctx.fill();}
  };
  return <section id="workflow" ref={root} className="workspace-orbit" data-assembled={assembled === null ? "auto" : String(assembled)} aria-labelledby="orbit-title">
    <header><span className="launch-eyebrow">BUILT AROUND YOUR REPOSITORY</span><h2 id="orbit-title">One workspace.<br/>Every step of the build.</h2><p>Give the agent context. Follow the changes.<br/>Keep your terminal and preview within reach.</p></header>
    <div className="orbit-stage"><div className="orbit-path" aria-hidden="true"/><div className="orbit-mascot"><img src="/logo.png" alt="Supercharge mascot rendered in dots" onLoad={e=>paint(e.currentTarget)}/><canvas ref={canvas} aria-hidden="true"/></div>
      <div className="orbit-card orbit-agent"><span>01 / AGENT</span><h3>Fix the session redirect.</h3><p>Read the handler. Propose a change.</p><code>+ return redirect('/sign-in');</code></div>
      <div className="orbit-card orbit-terminal"><span>02 / TERMINAL</span><h3>Verify the change.</h3><code>$ npm test -- session</code><p className="orbit-success">✓ 3 tests passed</p></div>
      <div className="orbit-card orbit-browser"><span>03 / BROWSER</span><div className="browser-example"><span>Welcome back.</span><div>Email address</div><strong>Sign in <ArrowRight size={12}/></strong></div></div>
      <img className="orbit-assembled" src="/studio-desktop.png" width="1920" height="1044" alt="Actual Studio interface bringing the workspace together" loading="lazy"/>
    </div><div className="orbit-caption"><span>Illustrative workflow · Actual Studio interface when assembled</span><button type="button" onClick={()=>setAssembled(!assembled)} aria-pressed={assembled === true}>{assembled?<RotateCcw size={14}/>:<Layers size={14}/>} {assembled?'Explore the layers':'Bring it together'}</button></div>
  </section>;
}
