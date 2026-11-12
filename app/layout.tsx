import { SITE_URL, SITE_DESCRIPTION } from '@/lib/seo';
import type { Metadata, Viewport } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import './editorial.css';
import './studio-hero.css';
import './dark-theme.css';
import './landing-polish.css';
import { Inter } from 'next/font/google';


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Supercharge — AI Coding Agent for CLI & Studio', template: '%s | Supercharge' },
  description: SITE_DESCRIPTION,
  applicationName: 'Supercharge',
  icons: { icon: '/logo.png', apple: '/logo.png' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};




const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen min-w-0 flex-col" suppressHydrationWarning>
        <RootProvider theme={{ defaultTheme: 'dark', enableSystem: false }}>
          <main className="flex-1">{children}</main>
        </RootProvider>
      </body>
    </html>
  );
}
