import type { Metadata, Viewport } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import './editorial.css';
import { Inter } from 'next/font/google';


export const metadata: Metadata = {
  metadataBase: new URL('https://superchargeai.in'),
  title: 'Supercharge — Your code. Your models. Your workspace.',
  description:
    'An AI coding agent for your terminal and desktop. Bring your own model, work with your local repo, and make Supercharge your own.',
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
        <RootProvider>
          <main className="flex-1">{children}</main>
        </RootProvider>
      </body>
    </html>
  );
}
