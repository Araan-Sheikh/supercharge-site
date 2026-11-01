import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
const env = { ...process.env, PLUGIN_ADMIN_KEY:'local-e2e-admin-key-12345678901234567890123456789', PLUGIN_SESSION_SECRET:'local-e2e-session-secret-1234567890123456789012345', PLUGIN_CATALOG_READ_TOKEN:'local-e2e-catalog-token-1234567890123456789012345', PLUGIN_PUBLIC_ORIGIN:'http://127.0.0.1:3018', PLUGIN_DATABASE_PATH:join(mkdtempSync(join(tmpdir(),'supercharge-site-test-')),'catalog.sqlite'), CLOUDFLARE_ACCOUNT_ID:'', PLUGIN_D1_DATABASE_ID:'', CLOUDFLARE_D1_API_TOKEN:'', NEXT_TELEMETRY_DISABLED:'1' };
const child = spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3018'],{stdio:'inherit',env});
for (const signal of ['SIGTERM','SIGINT']) process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??1));
