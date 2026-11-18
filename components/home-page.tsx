'use client';

import Link from 'next/link';
import { CapabilityBrowser } from '@/components/capability-browser';
import { WorkspaceControls } from '@/components/workspace-controls';
import { WorkspaceOrbit } from '@/components/workspace-orbit';
import { WalkthroughPlayer } from '@/components/walkthrough-player';
import { StudioHero } from '@/components/studio-hero';
import { useEffect, useRef, useState } from 'react';
import { startupPrograms } from '@/components/home-content';
import { HomeSetup } from '@/components/home-setup';
import { androidUniversal, studioLatestDownload } from '@/lib/studio-downloads';
import { ArrowRight, ArrowUpRight, Download, Plus } from 'lucide-react';

const questions = [
  ['What does it cost?', 'Supercharge is free to use. There is no Supercharge subscription or credit balance. You bring your own model provider, whose usage charges may apply. Studio is closed source.'],
  ['Do I need to install the CLI?', 'Yes. Install the CLI and run /setup to connect a provider first. Studio can then start the agent in the background or attach to an existing session.'],
  ['Does my code stay on my computer?', 'The agent and its tools run on your computer. Model requests go to the endpoint you configure, so local execution does not mean that all data stays on your device.'],
  ['How do I connect my phone?', 'Install Studio on your computer and the Android app on your phone. In Studio, open Settings → Devices → Show pairing code, scan the code on your phone, then approve the pairing on your computer.'],
];

export default function HomePage() {

  const root = useRef<HTMLDivElement>(null);
  const [phone, setPhone] = useState(0);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches) continue;
        const children = Array.from(entry.target.children);
        children.forEach((child, index) => {
          const animation = child.animate([
            { opacity: 0, transform: 'translateY(22px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ], { duration: 650, delay: Math.min(index * 90, 270), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        });
      }
    }, { threshold: 0, rootMargin: '0px 0px -48px 0px' });
    // Keep content visible before hydration and when navigating directly to a section.
    root.current?.querySelectorAll(':scope > section:not(:first-child)').forEach(section => {
      if (section.getBoundingClientRect().top > window.innerHeight) observer.observe(section);
    });
    const stopMotion = () => {
      if (preference.matches) { animations.forEach(animation => animation.cancel()); animations.clear(); }
    };
    preference.addEventListener('change', stopMotion);
    return () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      preference.removeEventListener('change', stopMotion);
    };
  }, []);
  return <div className="studio-landing" ref={root}>
    <StudioHero/>

    <section className="programs wrap" aria-labelledby="startup-programs">
      <div className="program-heading"><h2 id="startup-programs">Startup programs supporting Supercharge</h2><Link href="/donate">Support the project <ArrowUpRight size={13}/></Link></div>
      <div className="program-logos">{startupPrograms.map(item => <a href={item.href} key={item.name} aria-label={`${item.name} — ${item.note}`}><img src={item.logo} alt="" className={item.wordmark ? 'wordmark' : ''}/>{!item.wordmark && <strong>{item.name}</strong>}<small>{item.note}</small></a>)}<a href="https://e2b.dev/startups" aria-label="E2B Startup Program"><img className="e2b-badge" src="/e2b/startup_badge-nameplate-outline-white.svg" alt="E2B Startup Program"/></a></div>
    </section>
    <WorkspaceOrbit/>

    <section className="studio-workflow wrap" id="walkthrough">
      <div className="studio-section-copy"><span className="quiet-label">See it in practice</span><h2>A real repo.<br/>A real session.</h2><p>35 seconds inside the CLI. Follow the agent as it reads project files and finds its way around a codebase.</p><Link href="/docs/modes" className="text-button">Explore ways to use Supercharge <ArrowRight size={15}/></Link></div>
      <WalkthroughPlayer/>
    </section>

    <section className="phone-section wrap" id="mobile-gallery">
      <div className="studio-section-copy"><span className="quiet-label">Studio for Android</span><h2>Check in<br/>from your phone.</h2><p>Pair your phone with Studio to follow conversations, revisit chats, and switch projects. The agent keeps running on your computer.</p><div className="phone-controls" role="group" aria-label="Android screenshots">{['Conversation','Chat history','Projects'].map((label,i)=><button key={label} aria-pressed={phone===i} onClick={()=>setPhone(i)}>{label}<ArrowRight size={14}/></button>)}</div><a className="text-button" href={`${studioLatestDownload}/${androidUniversal.file}`}>Download Android <Download size={15}/></a></div>
      <div className="phone-stage"><img className="phone-companion" loading="lazy" width="420" height="850" src={['/studio-phone-chats.png','/studio-phone-projects.png','/studio-phone-chat.png'][phone]} alt="" aria-hidden="true"/><div className="phone-stage-caption"><span>STUDIO MOBILE</span><span>Android</span></div><img key={phone} loading="lazy" width="420" height="850" src={['/studio-phone-chat.png','/studio-phone-chats.png','/studio-phone-projects.png'][phone]} alt={['Android agent conversation','Android chat history','Android project list'][phone]}/></div>
    </section>
    <WorkspaceControls/>
    <CapabilityBrowser/>
    <HomeSetup/>

    <section className="studio-faq wrap"><div className="faq-intro"><h2>A few things<br/>to know.</h2><p>A few answers about setup, pricing, and where your code goes.</p><Link href="/docs">Explore the docs <ArrowUpRight size={15}/></Link></div><div>{questions.map(([question,answer])=><details key={question}><summary>{question}<Plus size={17}/></summary><p>{answer}</p></details>)}</div></section>


  </div>;
}
