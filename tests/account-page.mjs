import {spawn} from 'node:child_process';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
import {pathToFileURL} from 'node:url';
if(!process.env.DIOKA_BROWSER_PACKAGE)throw new Error('Set DIOKA_BROWSER_PACKAGE to your installed Playwright module path.');
const directory=await mkdtemp(join(tmpdir(),'dioka-integration-')),port=Number(process.env.TEST_PORT||3087),origin='http://127.0.0.1:'+port;let output='';
const env={...process.env,NODE_ENV:'production',DIOKA_SITE_URL:origin,DIOKA_DATA_DIR:directory,DIOKA_SCALE_MODE:'false',DIOKA_ADMIN_EMAILS:'owner@example.test',SUPABASE_URL:'',NEXT_PUBLIC_SUPABASE_URL:'',SUPABASE_SERVICE_ROLE_KEY:'',DIOKA_GOOGLE_AUTH_PROVIDER:'supabase',DIOKA_SUPABASE_GOOGLE_ENABLED:'false',DIOKA_STORE_LIVE:'false',NODE_OPTIONS:''};
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p',String(port),'-H','127.0.0.1'],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});server.stdout.on('data',data=>output+=data);server.stderr.on('data',data=>output+=data);let browser;
try{const deadline=Date.now()+90000;while(Date.now()<deadline){if(server.exitCode!==null)throw new Error(output);try{if((await fetch(origin+'/api/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,300));}const {chromium}=await import(pathToFileURL(process.env.DIOKA_BROWSER_PACKAGE).href);browser=await chromium.launch({headless:true,channel:process.env.DIOKA_BROWSER_CHANNEL||'chrome'});await import('./account-browser.mjs').then(m=>m.accountBrowserChecks({browser,origin,password:randomBytes(18).toString('base64url')}));}catch(error){console.error(error);console.error(output.slice(-5000));process.exitCode=1;}finally{await browser?.close();if(server.exitCode===null){const stopped=new Promise(r=>server.once('exit',r));server.kill();await stopped;}}
