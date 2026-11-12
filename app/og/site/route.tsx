import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export function GET() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '68px 76px', background: '#101014', color: '#f8f7f4', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', fontSize: 25, letterSpacing: 5, color: '#bbb6ce' }}>SUPERCHARGE</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -5, lineHeight: 1.05 }}>Start with your code.</div>
        <div style={{ fontSize: 30, color: '#bdbac6' }}>Your repository. Your models. Your workspace.</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #39353f', paddingTop: 28, fontSize: 22 }}>
        <span>CLI + Studio</span><span style={{ color: '#c8b3ff' }}>superchargeai.in</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
