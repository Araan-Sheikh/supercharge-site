'use client';

import Link from 'next/link';
import { StudioHero } from '@/components/studio-hero';
import { useEffect, useRef, useState } from 'react';
import { capabilities, startupPrograms } from '@/components/home-content';
import { DownloadOptions } from '@/components/download-options';
import { androidUniversal, serverDownloads, studioLatestDownload } from '@/lib/studio-downloads';
import { ArrowRight, ArrowUpRight, Download, Plus } from 'lucide-react';
import { InstallCommand } from '@/components/install-command';

const features = [
  {
    title: 'Work in your repository',
    body: 'The agent reads files, edits code, and runs commands on your computer. Use Agent to make changes, Plan to think them through, or Ask to understand the code.',
    link: '/docs/agents', label: 'Agent modes',
  },
  {
    title: 'Connect your model provider',
    body: 'Use your own API key and endpoint. Supercharge supports Chat Completions, Anthropic Messages, and OpenAI Responses.',
    link: '/docs/setup', label: 'Provider setup',
  },
  {
    title: 'Choose what the agent can do',
    body: 'Configure tool approvals and allow or deny rules. Add MCP servers, skills, and custom agents when your work needs them.',
    link: '/docs/permissions', label: 'Permissions & control',
  },
];
const questions = [
  ['What does it cost?', 'Supercharge is free to use. There is no Supercharge subscription or credit balance. You bring your own model provider, whose usage charges may apply. Studio is closed source.'],
  ['Do I need to install the CLI?', 'Yes. Install the CLI and run /setup to connect a provider first. Studio can then start the agent in the background or attach to an existing session.'],
  ['Does my code stay on my computer?', 'The agent and its tools run on your computer. Model requests go to the endpoint you configure, so local execution does not mean that all data stays on your device.'],
  ['How do I connect my phone?', 'Install Studio on your computer and the Android app on your phone. In Studio, open Settings → Devices → Show pairing code, scan the code on your phone, then approve the pairing on your computer.'],
];

export default function HomePage() {

  const root = useRef<HTMLDivElement>(null);
  const [capability, setCapability] = useState(0);
  const [phone, setPhone] = useState(0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    root.current?.querySelectorAll('section:not(:first-child)').forEach(section => { section.classList.add('reveal-section'); observer.observe(section); });
    return () => observer.disconnect();
  }, []);
  return <div className="studio-landing" ref={root}>
    <StudioHero/>

    <section className="programs wrap" aria-labelledby="startup-programs">
      <div className="program-heading"><h2 id="startup-programs">Startup programs supporting Supercharge</h2><Link href="/donate">Support the project <ArrowUpRight size={13}/></Link></div>
      <div className="program-logos">{startupPrograms.map(item => <a href={item.href} key={item.name} aria-label={`${item.name} — ${item.note}`}><img src={item.logo} alt="" className={item.wordmark ? 'wordmark' : ''}/>{!item.wordmark && <strong>{item.name}</strong>}<small>{item.note}</small></a>)}<a href="https://e2b.dev/startups" aria-label="E2B Startup Program"><img className="e2b-badge" src="/e2b/startup_badge-nameplate-outline-white.svg" alt="E2B Startup Program"/></a></div>
    </section>
    <section className="studio-features wrap" aria-label="How Supercharge works">
      {features.map(feature => <article key={feature.title}><h2>{feature.title}</h2><p>{feature.body}</p><Link href={feature.link}>{feature.label}<ArrowRight size={14}/></Link></article>)}
    </section>

    <section className="studio-workflow wrap" id="walkthrough">
      <div className="studio-section-copy"><span className="section-kicker">A LOOK INSIDE THE CLI</span><h2>See a session<br/>from start to finish.</h2><p>Use the CLI in your repo, open Studio for a desktop workspace, or connect your editor through ACP. It’s the same agent underneath.</p><Link href="/docs/modes" className="text-button">Explore ways to use Supercharge <ArrowRight size={15}/></Link></div>
      <div className="studio-video"><video src="/using-supercharge.mp4" controls playsInline preload="metadata" aria-label="Supercharge CLI walkthrough"/><span>Supercharge CLI · Product walkthrough</span></div>
    </section>

    <section className="capability-section wrap" id="capabilities">
      <div className="section-title"><h2>What’s in the CLI.</h2><Link href="/docs/slash">All commands <ArrowUpRight size={15}/></Link></div>
      <div className="capability-explorer"><div className="capability-list" role="group" aria-label="Explore capabilities">{capabilities.map((item,i) => <button type="button" key={item.title} aria-pressed={capability===i} onClick={()=>setCapability(i)}><span>{item.title}</span><ArrowRight size={15}/></button>)}</div>
      <div className="capability-detail" key={capability}><span className="detail-label">SUPERCHARGE CLI</span><code>{capabilities[capability].command}</code><h3>{capabilities[capability].title}</h3><p>{capabilities[capability].detail}</p><Link href={capabilities[capability].href}>Read the documentation <ArrowUpRight size={15}/></Link></div></div>
    </section>
    <section className="phone-section wrap" id="mobile-gallery">
      <div className="studio-section-copy"><span className="section-kicker">STUDIO FOR ANDROID</span><h2>Check in<br/>from your phone.</h2><p>Pair your phone with Studio to follow conversations, revisit chats, and switch projects. The agent keeps running on your computer.</p><div className="phone-controls" role="group" aria-label="Android screenshots">{['Conversation','Chat history','Projects'].map((label,i)=><button key={label} aria-pressed={phone===i} onClick={()=>setPhone(i)}>{label}<ArrowRight size={14}/></button>)}</div><a className="text-button" href={`${studioLatestDownload}/${androidUniversal.file}`}>Download Android <Download size={15}/></a></div>
      <div className="phone-stage"><img key={phone} src={['/studio-phone-chat.png','/studio-phone-chats.png','/studio-phone-projects.png'][phone]} alt={['Android agent conversation','Android chat history','Android project list'][phone]} loading="lazy"/></div>
    </section>
    <section className="home-setup wrap" id="studio-downloads"><div className="section-title"><h2>Set up Supercharge.</h2><Link href="/download">All downloads <ArrowUpRight size={15}/></Link></div><div className="setup-columns"><div className="setup-instructions"><h3>01. Install the CLI</h3><p>Start with the agent that powers Studio.</p><InstallCommand/><h3>Connect your model</h3><p>Run <code>/setup</code> to add your key or use a supported browser sign-in.</p><h3>Open your repository</h3><p>Launch Studio and choose a project. Use Agent, Plan, or Ask to start working.</p><Link className="text-button" href="/docs/setup">Setup guide <ArrowRight size={15}/></Link></div><DownloadOptions/></div><details className="server-downloads"><summary>Server downloads <Plus size={17}/></summary><div>{serverDownloads.map(item=><a href={`${studioLatestDownload}/${item.file}`} key={item.file}><span>{item.name}<small>{item.note}</small></span><Download size={16}/></a>)}</div></details></section>

    <section className="studio-faq wrap"><h2>A few things to know.</h2><div>{questions.map(([question,answer])=><details key={question}><summary>{question}<Plus size={17}/></summary><p>{answer}</p></details>)}</div></section>


  </div>;
}
