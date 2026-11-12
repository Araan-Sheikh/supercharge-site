'use client';

import { useId, useState } from 'react';
import { Pause, Play } from 'lucide-react';

export function BoostArt() {
  const id = useId().replace(/:/g, '');
  const [paused, setPaused] = useState(false);
  return <div className="boost-art" data-paused={paused}>
    <svg viewBox="0 0 1200 200" role="img" aria-label="Supercharge, in illuminated dot-matrix lettering">
      <defs>
        <pattern id={`${id}-dots`} width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.65" fill="white"/></pattern>
        <mask id={`${id}-letters`}><text x="0" y="149" textLength="1190" lengthAdjust="spacingAndGlyphs" fill="white" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="170" letterSpacing="-9">supercharge.</text></mask>
        <mask id={`${id}-matrix`}><rect width="1200" height="200" fill={`url(#${id}-dots)`}/></mask>
        <linearGradient id={`${id}-beam`}><stop stopColor="currentColor" stopOpacity="0"/><stop offset=".6" stopColor="currentColor"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient>
      </defs>
      <g mask={`url(#${id}-letters)`}><g mask={`url(#${id}-matrix)`}>
        <rect className="wordmark-base" width="1200" height="200" fill="currentColor"/>
        <rect className="wordmark-charge" width="240" height="200" fill={`url(#${id}-beam)`}/>
      </g></g>
    </svg>
    <button type="button" className="boost-pause" onClick={()=>setPaused(!paused)} aria-label={paused?'Play boost animation':'Pause boost animation'} aria-pressed={paused}>{paused?<Play size={13}/>:<Pause size={13}/>}</button>
  </div>;
}
