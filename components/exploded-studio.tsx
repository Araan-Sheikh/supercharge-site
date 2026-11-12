'use client';

import { DotImage } from '@/components/dot-image';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Layers3, MousePointer2, Pause, Play, RotateCcw, Terminal, FileCode2, Sparkles } from 'lucide-react';

export function ExplodedStudio({ onExpand }: { onExpand: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const [assembled, setAssembled] = useState<boolean | null>(null);
  const [paused, setPaused] = useState(false);
  const [combined, setCombined] = useState(false);
  const [reduced, setReduced] = useState(false);
  const tilt = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(preference.matches);
    sync(); preference.addEventListener('change', sync);
    return () => preference.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let frame = 0;
    const render = () => {
      const mobile = matchMedia('(max-width: 680px)').matches;
      const top = node.getBoundingClientRect().top;
      const progress = reduced || mobile ? 1 : assembled !== null ? Number(assembled) : Math.max(0, Math.min(1, (120 - top) / 260));
      node.style.setProperty('--spread', String(1 - progress));
      node.style.setProperty('--combined-opacity', String(Math.max(0, (progress - .7) / .3)));
      node.style.setProperty('--layers-opacity', String(Math.min(1, (1 - progress) / .3)));
      node.dataset.combined = String(progress > .9);
      setCombined(progress > .9);
      frame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
    render();
    if (!paused) window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [assembled, paused, reduced]);

  const move = (x: number, y: number) => {
    if (paused || reduced || !scene.current) return;
    tilt.current = { x, y };
    scene.current.style.setProperty('--pointer-x', `${x}deg`);
    scene.current.style.setProperty('--pointer-y', `${y}deg`);
  };

  return <div ref={root} className="exploded-studio" data-paused={paused || reduced} style={{ '--spread': 1 } as React.CSSProperties}>
    <div ref={scene} className="exploded-scene" role="group" aria-label="3D Studio workspace. Use arrow keys to rotate; Escape resets the view." tabIndex={0}
      onPointerMove={event => {if(event.pointerType==='touch')return;const bounds=event.currentTarget.getBoundingClientRect();move(((event.clientY-bounds.top)/bounds.height-.5)*-10,((event.clientX-bounds.left)/bounds.width-.5)*12);}}
      onPointerDown={event=>{if(event.pointerType!=='touch')event.currentTarget.setPointerCapture(event.pointerId);}}
      onPointerUp={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}
      onPointerLeave={()=>move(0,0)}
      onKeyDown={event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Escape'].includes(event.key))return;event.preventDefault();if(event.key==='Escape'){move(0,0);return;}move(Math.max(-10,Math.min(10,tilt.current.x+(event.key==='ArrowUp'?2:event.key==='ArrowDown'?-2:0))),Math.max(-12,Math.min(12,tilt.current.y+(event.key==='ArrowRight'?2:event.key==='ArrowLeft'?-2:0))));}}>
      <div className="hero-flying-logo" aria-hidden="true"><span className="hero-logo-trail"/><img src="/logo.png" width="64" height="64" alt=""/></div>
      <div className="exploded-floor" aria-hidden="true"/>
      <div className="exploded-stack" aria-hidden="true">
        <div className="workspace-layer layer-code"><div className="layer-top"><span><FileCode2 size={13}/> session.ts</span><span>01 / CODE</span></div><div className="code-layout"><div className="code-tree">workspace<br/><br/><span>⌄ src</span><br/>　 auth<br/>　 <b>session.ts</b><br/>　 index.ts<br/><br/>⌄ tests<br/>　 session.test.ts</div><pre><span className="line-muted">12</span> <i>export function</i> getSession() {'{'}{'\n'}<span className="line-muted">13</span>   <i>const</i> session = readToken();{'\n'}<span className="line-muted">14</span>{'\n'}<span className="code-added">15   if (session.expired) {'{'}{'\n'}16     return redirect('/sign-in');{'\n'}17   {'}'}</span>{'\n'}<span className="line-muted">18</span>   return session;{'\n'}<span className="line-muted">19</span> {'}'}</pre></div></div>
        <div className="workspace-layer layer-agent"><div className="layer-top"><span><Sparkles size={13}/> Supercharge</span><span>02 / AGENT</span></div><div className="agent-example"><div className="example-prompt">Fix the expired-session redirect.<ArrowUpRight size={14}/></div><p>I’ll check the session handler and its tests.</p><div className="example-tool"><span>↳</span> Read src/auth/session.ts <small>Read</small></div><div className="example-tool"><span>↳</span> Update session.test.ts <small>Edited</small></div><div className="example-input"><span>Ask a follow-up…</span><span>↑</span></div></div></div>
        <div className="workspace-layer layer-terminal"><div className="layer-top"><span><Terminal size={13}/> Terminal</span><span>03 / VERIFY</span></div><div className="terminal-example"><p><span>❯</span> npm test -- session</p><p className="test-line">✓ active session<br/>✓ expired session redirects<br/>✓ missing session</p><div><b>3 passed</b><span>Illustrative output</span></div></div></div>
        <div className="violet-cursor"><MousePointer2 size={20} fill="currentColor"/><span>supercharge</span></div>
      </div>
      <div className="combined-workspace"><DotImage src="/studio-desktop.png" width={1920} height={1044} alt="Actual Supercharge Studio desktop interface"/><span>One workspace. Your model.</span></div>
    </div>
    <div className="exploded-controls"><div className="exploded-controls-main"><button type="button" aria-pressed={combined} onClick={()=>setAssembled(root.current?.dataset.combined==='true'?false:true)}><Layers3 size={14}/> {combined?'Explore layers':'Bring it together'}</button><button type="button" className="exploded-reset" onClick={()=>{setAssembled(null);move(0,0);}} aria-label="Reset view and follow scrolling"><RotateCcw size={13}/></button></div><button type="button" aria-pressed={paused} onClick={()=>setPaused(!paused)} disabled={reduced} aria-label={paused?'Enable motion':'Pause motion'}>{paused||reduced?<Play size={13}/>:<Pause size={13}/>}</button><button type="button" className="actual-preview-link" onClick={onExpand}>Actual app <ArrowUpRight size={13}/></button></div>
  </div>;
}
