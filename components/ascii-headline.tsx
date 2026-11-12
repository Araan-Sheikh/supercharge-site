'use client';

import { useId } from 'react';

export function AsciiHeadline() {
  const id = useId().replace(/:/g, '');
  return <h1 id="sc-title" className="ascii-headline">
    <span className="ascii-headline-readable">Your code. Supercharged.</span>
    <svg viewBox="0 0 520 224" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={`${id}-dots`} width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="white"/></pattern>
        <mask id={`${id}-letters`}>
          <text x="0" y="99" fontSize="108" textLength="465" lengthAdjust="spacingAndGlyphs">Your code.</text>
          <text x="0" y="198" fontSize="80" textLength="516" lengthAdjust="spacingAndGlyphs">Supercharged.</text>
        </mask>
        <mask id={`${id}-matrix`}><rect width="520" height="224" fill={`url(#${id}-dots)`}/></mask>
        <linearGradient id={`${id}-light`}><stop stopColor="white" stopOpacity="0"/><stop offset=".5" stopColor="white"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient>
      </defs>
      <g mask={`url(#${id}-letters)`}><g mask={`url(#${id}-matrix)`}>
        <rect width="520" height="113" fill="var(--ink)"/>
        <rect y="113" width="520" height="111" fill="var(--accent)"/>
        <rect className="ascii-headline-charge" x="-160" width="160" height="224" fill={`url(#${id}-light)`}/>
      </g></g>
    </svg>
  </h1>;
}
