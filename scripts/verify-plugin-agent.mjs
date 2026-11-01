/** Opt-in integration check against the isolated local plugin test server. */
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const binary=process.env.SUPERCHARGE_TEST_BINARY;
if(!binary)throw new Error('Set SUPERCHARGE_TEST_BINARY to the rebuilt CLI executable');
const origin=new URL(process.env.SUPERCHARGE_TEST_SITE_ORIGIN||'http://127.0.0.1:3018');
if(!['127.0.0.1','localhost','[::1]'].includes(origin.hostname))throw new Error('This fixture must run against a loopback test site, never production');
const base=`${origin.origin}/api/plugins/v1`;
const key='local-e2e-admin-key-12345678901234567890123456789', token='local-e2e-catalog-token-1234567890123456789012345';
async function api(path,method='GET',data){const r=await fetch(`${base}${path}`,{method,headers:{Authorization:`Bearer ${key}`,...data?{'Content-Type':'application/json'}:{}},body:data?JSON.stringify(data):undefined});const value=await r.json();assert.ok(r.ok,`${r.status}: ${value.error}`);return value;}
const home=mkdtempSync(join(tmpdir(),'supercharge-catalog-native-'));
const name=`native-fixture-${Date.now()}`;
let document={name,displayName:'Native fixture',version:'1.0.0',description:'Native CLI verification',author:'Supercharge',visibility:'private',mcpServers:{},skills:[{name:'verify-install',description:'Verify a plugin install',instructions:'Read the selected project and produce a sourced draft.'}]};
const env={...process.env,HOME:home,XDG_CONFIG_HOME:join(home,'config'),XDG_DATA_HOME:join(home,'data'),SUPERCHARGE_HOME:home,SUPERCHARGE_PLUGIN_CATALOG_URL:base,SUPERCHARGE_PLUGIN_CATALOG_TOKEN:token,SUPERCHARGE_TELEMETRY_ENABLED:'false',SUPERCHARGE_FEEDBACK_ENABLED:'false',SUPERCHARGE_TRACE_UPLOAD:'false'};
function cli(args,success=true){const result=spawnSync(resolve(binary),['plugin',...args],{cwd:home,env,encoding:'utf8',timeout:60000});assert.equal(result.error,undefined);if(success)assert.equal(result.status,0,result.stderr);else assert.notEqual(result.status,0);return result;}
try{
 let p=await api('/admin/plugins','POST',{document});p=await api(`/admin/plugins/${name}/publish`,'POST',{revision:p.revision});
 const catalog=JSON.parse(cli(['catalog']).stdout);assert.ok(catalog.some(p=>p.name===name&&p.source===`catalog:${name}@1.0.0`));
 cli(['install',`catalog:${name}@1.0.0`,'--trust']);
 let listed=JSON.parse(cli(['list','--json']).stdout);assert.equal(listed.find(p=>p.name===name).version,'1.0.0');
 document={...document,version:'1.0.1',description:'Updated native fixture'};
 p=await api(`/admin/plugins/${name}`,'PUT',{revision:p.revision,document});p=await api(`/admin/plugins/${name}/publish`,'POST',{revision:p.revision});
 cli(['update',name]);listed=JSON.parse(cli(['list','--json']).stdout);assert.equal(listed.find(p=>p.name===name).version,'1.0.1');
 await api(`/admin/plugins/${name}`,'DELETE',{revision:p.revision});
 cli(['update',name],false);
 cli(['uninstall',name,'--confirm']);
 const seeded=await api('/admin/seed','POST',{});const docs=seeded.plugins.find(p=>p.name==='cloudflare-docs');assert.ok(docs);
 await api('/admin/plugins/cloudflare-docs/publish','POST',{revision:docs.revision});
 cli(['install','catalog:cloudflare-docs@1.0.0','--trust']);
 listed=JSON.parse(cli(['list','--json']).stdout);assert.ok(listed.some(p=>p.name==='cloudflare-docs'));
 cli(['uninstall','cloudflare-docs','--confirm']);
 console.log(JSON.stringify({starterInstall:'passed',catalog:'passed',privatePackageDownload:'passed',nativeInstall:'passed',nativeUpdate:'passed',archivedUpdate:'rejected',uninstall:'passed'}));
}finally{rmSync(home,{recursive:true,force:true});}
