// Run with node --env-file=.env.local scripts/configure-supabase-google.mjs [--apply].
// Credentials are read privately from the environment and never printed.
const ref='plwxwgqlpurfvqgzcuin';
const origin=new URL(process.env.DIOKA_SITE_URL||'https://diokacraft.com').origin;
if(!origin.startsWith('https://')&&!origin.startsWith('http://localhost:')&&!origin.startsWith('http://127.0.0.1:'))throw new Error('A secure website origin is required.');
const redirects=[origin+'/api/auth/supabase/callback'];
if(process.env.DIOKA_GOOGLE_LOCAL_REDIRECTS==='true')redirects.push('http://localhost:3000/api/auth/supabase/callback','http://127.0.0.1:3080/api/auth/supabase/callback');
console.log(JSON.stringify({project:ref,site:origin,websiteCallbacks:redirects,googleConsoleCallback:'https://'+ref+'.supabase.co/auth/v1/callback',mode:process.argv.includes('--apply')?'apply':'dry-run'},null,2));
if(!process.argv.includes('--apply')){console.log('No settings changed. Configure Google privately in the dashboard, or provide private management/Google credentials and use --apply.');process.exit(0);}
const token=process.env.SUPABASE_ACCESS_TOKEN,client=process.env.GOOGLE_CLIENT_ID,secret=process.env.GOOGLE_CLIENT_SECRET;
if(!token||!client?.endsWith('.apps.googleusercontent.com')||!secret)throw new Error('Private Supabase management token and Google OAuth client credentials are required. Do not paste them into chat.');
const endpoint='https://api.supabase.com/v1/projects/'+ref+'/config/auth';
const call=async(method,body)=>{const response=await fetch(endpoint,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('Supabase Auth configuration request failed ('+response.status+').');return response.json();};
const existing=await call('GET');const allowed=[...new Set([...(existing.uri_allow_list||'').split(',').map(v=>v.trim()).filter(Boolean),...redirects])];
await call('PATCH',{site_url:origin,uri_allow_list:allowed.join(','),external_google_enabled:true,external_google_client_id:client,external_google_secret:secret});
const verified=await call('GET');if(!verified.external_google_enabled||verified.site_url!==origin)throw new Error('Google provider settings did not verify.');
console.log('Google provider and exact callback URLs configured. Set DIOKA_SUPABASE_GOOGLE_ENABLED=true on the app server, restart, then complete a real Google sign-in test.');
