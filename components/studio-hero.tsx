'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { ArrowUpRight, Maximize2, X } from 'lucide-react';
import { InstallCommand } from './install-command';

const surfaces = ['Desktop', 'Terminal', 'Android'] as const;
export function StudioHero() {
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const previewButton = useRef<HTMLButtonElement>(null);
  const choose = (index: number) => { setActive(index); tabs.current[index]?.focus(); };
  return <section className="sc-hero" id="workspace" aria-labelledby="sc-title">
    <div className="sc-hero-grid">
      <div className="sc-intro">
        <p className="sc-edition">STUDIO / 01 <span>v1.0.9</span></p>
        <h1 id="sc-title">Start with<br/>your code.</h1>
        <p className="sc-description">Your agent, terminal, and browser.<br/>In one place.</p>
        <div className="sc-actions"><Link href="/download" className="sc-download">Download Studio <ArrowUpRight size={20}/></Link><Link href="/docs/install" className="sc-cli">Install the CLI <ArrowUpRight size={13}/></Link></div>
        <p className="sc-model-note">Bring your own model.</p>
        <p className="sc-platform-note">macOS, Windows & Linux · Free to use<small>Your provider’s usage charges may apply.</small></p>
      </div>
      <div className="sc-product">
        <div className="sc-product-label">YOUR MODEL.<br/>YOUR MACHINE.</div>
        <div className="sc-panel" id={`sc-panel-${active}`} role="tabpanel" aria-labelledby={`sc-tab-${active}`} tabIndex={0}>
          {active === 0 && <div className="sc-desktop-view"><img src="/studio-desktop.png" width="1920" height="1044" fetchPriority="high" alt="Actual Supercharge Studio interface with projects and an agent conversation"/><button ref={previewButton} className="sc-expand" type="button" onClick={()=>dialog.current?.showModal()}><Maximize2 size={14}/> View full screenshot</button></div>}
          {active === 1 && <div className="sc-terminal-view"><div className="sc-window-caption"><span>supercharge / terminal</span><span>CLI</span></div><pre><span>$</span> cd my-project{'\n'}<span>$</span> supercharge</pre><h2>Work from your terminal.</h2><p>Connect a provider with <code>/setup</code>, then ask the agent to work in your repository.</p><InstallCommand/><Link href="/docs/commands">Browse commands <ArrowUpRight size={14}/></Link></div>}
          {active === 2 && <div className="sc-phone-view"><div><span className="sc-window-caption">STUDIO / ANDROID</span><h2>Take the<br/>conversation<br/>with you.</h2><p>Pair with Studio on your computer to follow the agent from your phone.</p><Link href="/download#mobile">Get the Android app <ArrowUpRight size={15}/></Link></div><img src="/studio-phone-chat.png" width="420" height="850" alt="Actual Supercharge Android conversation"/></div>}
        </div>
      </div>
    </div>
    <div className="sc-switcher" role="tablist" aria-label="Explore Supercharge on your devices" onKeyDown={event=>{const keys=['ArrowRight','ArrowLeft','Home','End'];if(!keys.includes(event.key))return;event.preventDefault();choose(event.key==='Home'?0:event.key==='End'?2:(active+(event.key==='ArrowRight'?1:2))%3);}}>{surfaces.map((label,index)=><button type="button" key={label} ref={node=>{tabs.current[index]=node;}} id={`sc-tab-${index}`} role="tab" aria-selected={active===index} aria-controls={`sc-panel-${index}`} tabIndex={active===index?0:-1} onClick={()=>setActive(index)}>{label}</button>)}</div>
    <dialog ref={dialog} className="sc-image-dialog" aria-label="Full Supercharge Studio screenshot" onClose={()=>previewButton.current?.focus()} onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}><div><button type="button" autoFocus onClick={()=>dialog.current?.close()} aria-label="Close screenshot"><X size={22}/></button><img src="/studio-desktop.png" width="1920" height="1044" alt="Full Supercharge Studio screenshot, including project sidebar, agent conversation and browser panel"/><p>Supercharge Studio · Actual interface</p></div></dialog>
  </section>;
}
