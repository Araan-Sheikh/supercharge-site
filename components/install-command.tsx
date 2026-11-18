'use client';
import { useEffect, useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
export function InstallCommand({ platform }: { platform?: 'macOS' | 'Windows' | 'Linux' }) {
  const [os, setOs] = useState('unix');
  const [status, setStatus] = useState('');
  useEffect(() => { if (/Windows/i.test(navigator.userAgent)) setOs('windows'); }, []);
  const selectedOS = platform ? (platform === 'Windows' ? 'windows' : 'unix') : os;
  const command = selectedOS === 'windows' ? 'irm https://www.superchargeai.in/install.ps1 | iex' : 'curl -fsSL https://www.superchargeai.in/install.sh | bash';
  useEffect(() => setStatus(''), [platform]);
  async function copy() {
    try { await navigator.clipboard.writeText(command); setStatus('Copied to clipboard'); }
    catch { setStatus('Select the command and copy it manually.'); }
  }
  return <div className="install-box"><div className="install-top"><span><Terminal size={15}/> Install the CLI</span>{!platform && <label><span className="sr-only">Operating system</span><select value={os} onChange={e => {setOs(e.target.value);setStatus('');}}><option value="unix">macOS / Linux</option><option value="windows">Windows</option></select></label>}</div><div className="command-line"><code>{command}</code><button type="button" onClick={copy} aria-label="Copy install command">{status === 'Copied to clipboard' ? <Check size={17}/> : <Copy size={17}/>}</button></div><p className="copy-status" role="status">{status || (selectedOS === 'windows' ? 'Run in PowerShell, then launch supercharge.' : 'Run in your terminal, then launch supercharge.')}</p></div>;
}
