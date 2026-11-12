'use client';

import { useRef, useState } from 'react';

/** Render the existing product image as a dot matrix without replacing its source. */
export function DotImage({ src, alt, width, height }: { src: string; alt: string; width?: number; height?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [original, setOriginal] = useState(false);
  const render = (image: HTMLImageElement) => {
    const target = canvas.current;
    if (!target) return;
    const ctx = target.getContext('2d');
    if (!ctx) return;
    const columns = 160;
    const rows = Math.round(columns * image.naturalHeight / image.naturalWidth);
    const sample = document.createElement('canvas');
    sample.width = columns;
    sample.height = rows;
    const source = sample.getContext('2d', { willReadFrequently: true });
    if (!source) return;
    source.drawImage(image, 0, 0, columns, rows);
    const pixels = source.getImageData(0, 0, columns, rows).data;
    target.width = columns * 6;
    target.height = rows * 6;
    ctx.fillStyle = '#111216';
    ctx.fillRect(0, 0, target.width, target.height);
    for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
      const i = (y * columns + x) * 4;
      const luminance = (pixels[i] * .2126 + pixels[i + 1] * .7152 + pixels[i + 2] * .0722) / 255;
      ctx.fillStyle = `rgb(${Math.max(74, pixels[i])} ${Math.max(65, pixels[i + 1])} ${Math.max(95, pixels[i + 2])})`;
      ctx.beginPath();
      ctx.arc(x * 6 + 3, y * 6 + 3, .7 + Math.sqrt(luminance) * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    setReady(true);
  };
  return <div className={`dot-image ${ready && !original ? 'dot-image-active' : ''}`}>
    <img src={src} alt={alt} width={width} height={height} loading="lazy" onLoad={event => render(event.currentTarget)} />
    <canvas ref={canvas} aria-hidden="true" />
    {ready && <button type="button" className="dot-image-toggle" aria-pressed={original} onClick={() => setOriginal(!original)}>{original ? 'Dot view' : 'Original image'} <span aria-hidden="true">↗</span></button>}
  </div>;
}
