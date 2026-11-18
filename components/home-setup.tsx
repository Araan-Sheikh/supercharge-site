'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Download, Plus, ArrowRight } from 'lucide-react';
import { InstallCommand } from './install-command';
import { desktopDownloads, serverDownloads, studioLatestDownload, studioReleasePage } from '@/lib/studio-downloads';
const platforms = ['macOS', 'Windows', 'Linux'] as const;
export function HomeSetup() {
  const [platform, setPlatform] = useState<typeof platforms[number]>('macOS');
  useEffect(() => { const ua = navigator.userAgent; if (/Windows/i.test(ua)) setPlatform('Windows'); else if (/Linux/i.test(ua) && !/Android/i.test(ua)) setPlatform('Linux'); }, []);
  const downloads = desktopDownloads.filter(item => platform === 'Linux' ? /Linux|Debian|Fedora/.test(item.name) : item.name.startsWith(platform));
  return <section className="home-setup wrap" id="studio-downloads" aria-labelledby="setup-title">
    <div className="setup-heading"><div><span className="quiet-label">Get started</span><h2 id="setup-title">Your repository.<br/>Your next session.</h2></div><div><p>Install the CLI, connect your provider,<br/>then open your project in Studio.</p><div className="platform-switch" role="group" aria-label="Installation platform">{platforms.map(p => <button key={p} type="button" aria-pressed={p === platform} onClick={() => setPlatform(p)}>{p}</button>)}</div></div></div>
    <div className="installation-grid"><div className="installation-cli"><span className="setup-step">01 / THE ENGINE</span><h3>Start in your terminal.</h3><InstallCommand platform={platform}/><div className="provider-instruction"><code>/setup</code><div><strong>Connect your model provider</strong><p>Launch <code>supercharge</code>, then run <code>/setup</code> to add your key or use a supported browser sign-in.</p><Link href="/docs/setup">Provider setup guide <ArrowRight size={14}/></Link></div></div></div>
    <div className="installation-studio"><span className="setup-step">02 / THE WORKSPACE</span><h3>Bring it into Studio.</h3><p>Open Studio and choose your repository. The CLI powers your agent in the background.</p><div className="platform-downloads" aria-live="polite">{downloads.map(item => <a key={item.file} href={`${studioLatestDownload}/${item.file}`}><div><strong>{item.name}</strong><span>{item.note}</span></div><Download size={20}/></a>)}</div><a className="release-link" href={studioReleasePage}>Release notes & checksums <ArrowUpRight size={14}/></a></div></div>
    <details className="server-downloads"><summary>Running Studio on a server? <Plus size={17}/></summary><div>{serverDownloads.map(item => <a href={`${studioLatestDownload}/${item.file}`} key={item.file}><span>{item.name}<small>{item.note}</small></span><Download size={16}/></a>)}</div></details>
  </section>;
}
