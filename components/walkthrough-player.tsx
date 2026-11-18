'use client';

import { useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

export function WalkthroughPlayer() {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState('');
  const play = async () => {
    const player = video.current;
    if (!player) return;
    if (ended) player.currentTime = 0;
    try { await player.play(); setStarted(true); setEnded(false); setError(''); }
    catch { setError('Playback could not start. Try the video controls.'); setStarted(true); }
  };
  return <div className="studio-video walkthrough-player">
    <div className="walkthrough-bar"><span>supercharge / terminal</span><span>PRODUCT RECORDING · 35 SEC</span></div>
    <div className="walkthrough-screen">
      <video ref={video} src="/using-supercharge.mp4" poster="/walkthrough-poster.webp" controls={started} playsInline preload="none" aria-label="Supercharge exploring a repository" onEnded={()=>setEnded(true)} onError={()=>setError('The recording could not load. You can open it directly below.')}/>
      {(!started || ended) && <button type="button" className="walkthrough-play" onClick={play}><span className="walkthrough-play-icon">{ended?<RotateCcw size={25}/>:<Play size={25} fill="currentColor"/>}</span><strong>{ended?'Watch again':'See the agent at work'}</strong><span>35 seconds · CLI walkthrough</span></button>}
    </div>
    <div className="walkthrough-caption"><span>{error || 'A real session: reading files and exploring a codebase.'}</span><a href="/using-supercharge.mp4">Open recording ↗</a></div>
  </div>;
}
