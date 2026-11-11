import type { Metadata, Viewport } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';


export const metadata: Metadata = {
  metadataBase: new URL('https://superchargeai.in'),
  title: 'Supercharge — CLI docs',
  description:
    'Docs for the Supercharge CLI: a free Rust coding agent. Bring your own model key, then run the terminal, the ACP server, or the inbox daemon.',
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
