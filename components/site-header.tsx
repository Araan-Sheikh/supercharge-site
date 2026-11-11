'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [{ href: '/#workspace', label: 'Product' }, { href: '/plugins', label: 'Plugins' }, { href: '/docs', label: 'Documentation' }];
  return <header className="site-header">
    <a className="skip-link" href="#site-content">Skip to content</a>
    <div className="site-nav wrap">
      <Link href="/" className="brand" aria-label="Supercharge home"><img src="/logo.png" width="30" height="30" alt="" />supercharge<span className="brand-period">.</span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(l => <Link key={l.href} href={l.href} aria-current={pathname === l.href ? 'page' : undefined}>{l.label}</Link>)}</nav>
      <Link href="/download" className="button button-small nav-download">Download <ArrowUpRight size={15} /></Link>
      <button type="button" className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
    </div>
    {open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{[...links, { href: '/download', label: 'Get Supercharge' }].map(l => <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}<ArrowUpRight size={16}/></Link>)}</nav>}
  </header>;
}
