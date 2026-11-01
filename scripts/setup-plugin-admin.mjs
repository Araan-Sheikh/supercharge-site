import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, renameSync, chmodSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
const args=process.argv.slice(2);
const value=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0?args[i+1]:fallback;};
const file=resolve(value('--file','.env.local'));
const origin=new URL(value('--origin','http://localhost:3000'));
if(origin.protocol!=='https:'&&!['localhost','127.0.0.1','[::1]'].includes(origin.hostname))throw new Error('Use HTTPS for a non-local site');
if(origin.username||origin.password||origin.search||origin.hash||origin.pathname!=='/')throw new Error('Supply an origin without credentials or path');
let existing='';try{existing=readFileSync(file,'utf8');}catch(e){if(e.code!=='ENOENT')throw e;}
if(/^PLUGIN_ADMIN_KEY=.+/m.test(existing))throw new Error('An administrator key already exists. Refusing to replace it.');
const fields={PLUGIN_PUBLIC_ORIGIN:origin.origin,PLUGIN_ADMIN_KEY:randomBytes(32).toString('hex'),PLUGIN_SESSION_SECRET:randomBytes(32).toString('hex'),PLUGIN_CATALOG_READ_TOKEN:randomBytes(32).toString('hex')};
const prefix=existing.split('\n').filter(line=>!Object.keys(fields).some(key=>line.startsWith(`${key}=`))).join('\n').trimEnd();
const temporary=join(dirname(file),`.plugin-env-${randomBytes(8).toString('hex')}`);
writeFileSync(temporary,`${prefix}\n\n# Plugin platform (server-only secrets)\n${Object.entries(fields).map(([k,v])=>`${k}=${v}`).join('\n')}\n`,{mode:0o600,flag:'wx'});
renameSync(temporary,file);chmodSync(file,0o600);
console.log(`Plugin administrator settings saved to ${file}. Restart the site, then open /admin/plugins. Read the key locally from this file; it is not printed here.`);
