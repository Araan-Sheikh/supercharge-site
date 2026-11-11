'use client';
import { useState } from 'react';
import { ArrowDownToLine, ArrowUpRight } from 'lucide-react';
import { desktopDownloads, studioLatestDownload, studioReleasePage } from '@/lib/studio-downloads';
export function DownloadOptions() {
  const [os, setOs] = useState('macOS');
  const options = desktopDownloads.filter(d => os === 'macOS' ? d.name === 'macOS' : os === 'Windows' ? d.name.startsWith('Windows') : !d.name.startsWith('Windows') && d.name !== 'macOS');
  return <div className="download-panel"><h2>02. Choose your desktop app</h2><p>Studio runs on the CLI. Pick your operating system to see available builds.</p><div className="os-selector" role="group" aria-label="Desktop operating system">{['macOS','Windows','Linux'].map(name => <button type="button" key={name} aria-pressed={os===name} onClick={()=>setOs(name)}>{name}</button>)}</div>{options.map(d => <a className="download-row" key={d.file} href={`${studioLatestDownload}/${d.file}`}><span><strong>{d.name}</strong><small>{d.note}</small></span><ArrowDownToLine size={19}/></a>)}<a className="text-button" style={{marginTop:20}} href={studioReleasePage}>Release files and checksums <ArrowUpRight size={15}/></a></div>;
}
