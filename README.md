# Supercharge site

Docs site for the Supercharge CLI. The layout and docs AI come from the [VectraDocs](https://github.com/iotserver24/VectraDocs) template (Next.js, Fumadocs, Orama).

## Develop

```bash
npm install
cp .env.example .env.local   # optional, only needed for the docs chat
npm run dev
```

Open http://localhost:3000. Docs live at `/docs`. The public domain is https://superchargeai.in.

Install scripts are the copies from `supercharge-releases`, served at `/install.sh` and `/install.ps1`. They still download release binaries from `iotserver24/supercharge-releases`.

The chat answers from the built search index. Run `npm run build:index` before expecting answers, or use `npm run build`, which builds the index first.

## Plugin platform

This site also serves the plugin owner control panel at `/admin/plugins`, the public directory at `/plugins`, and the catalog/management API at `/api/plugins/v1`. See [PLUGIN-PLATFORM.md](PLUGIN-PLATFORM.md) for setup, database options, authentication, deployment and CLI/app integration.
