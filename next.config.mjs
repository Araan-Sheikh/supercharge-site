import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async headers() {
    return [
      ...['/api/:path*', '/admin/:path*', '/donate/result', '/docs-md/:path*', '/llms-full.txt'].map(source => ({
        source,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      })),
      {
        source: '/install.ps1',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

export default withMDX(config);
