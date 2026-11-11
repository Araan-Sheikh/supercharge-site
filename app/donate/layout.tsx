import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/Footer';
export default function Layout({children}: {children: React.ReactNode}) { return <div className="site" id="top"><SiteHeader/><div id="site-content">{children}</div><Footer/></div>; }
