import { BoostArt } from '@/components/boost-art';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
const groups = [
  { name: 'Product', links: [['Download Studio', '/download'], ['Install the CLI', '/docs/install'], ['Plugins', '/plugins']] },
  { name: 'Resources', links: [['Documentation', '/docs'], ['Provider setup', '/docs/setup'], ['Permissions', '/docs/permissions']] },
  { name: 'Project', links: [['GitHub', 'https://github.com/iotserver24/supercharge-app'], ['Releases', 'https://github.com/iotserver24/supercharge-releases'], ['Support the project', '/donate']] },
];
export function Footer() {
  return <footer className="site-footer"><div className="wrap footer-grid"><div><Link href="/" className="brand"><img src="/logo.png" width="28" height="28" alt=""/>supercharge<span className="brand-period">.</span></Link><p>The coding agent for your<br/>terminal and desktop.</p><span className="footer-note">Free to use. Bring your own model.</span></div>{groups.map(g => <div key={g.name}><h2>{g.name}</h2>{g.links.map(([label, href]) => <Link key={href} href={href}>{label}{href.startsWith('https') && <ArrowUpRight size={12}/>}</Link>)}</div>)}</div><div className="wrap footer-signature"><BoostArt/></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} R3AP3R Editz</span><span>Supercharge CLI & Studio</span><a href="#top">Back to top ↑</a></div></footer>;
}
