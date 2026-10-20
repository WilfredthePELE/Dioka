import assert from 'node:assert/strict';
export async function googleChecks({origin,password}){
let index=10;
async function start({returnTo='/',cart=[],cookie='',connect=false}={}){
 const response=await fetch(origin+'/api/auth/google',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Forwarded-For':'10.8.0.'+(index++),Cookie:cookie},body:JSON.stringify({returnTo,cart,connect})});
 assert.equal(response.status,200);const data=await response.json();const url=new URL(data.url);
 assert.equal(url.origin,'https://accounts.google.com');assert.equal(url.searchParams.get('code_challenge_method'),'S256');
 assert.match(response.headers.get('set-cookie'),/HttpOnly/i);
 return {url,cookie:[response.headers.getSetCookie()[0].split(';')[0],cookie].filter(Boolean).join('; ')};
}
async function finish(transaction,overrides={}){
 const code=Buffer.from(JSON.stringify({sub:'google-client-1',email:'dioka.client@gmail.com',name:'Google Client',nonce:transaction.url.searchParams.get('nonce'),challenge:transaction.url.searchParams.get('code_challenge'),...overrides})).toString('base64url');
 return fetch(origin+'/api/auth/google/callback?state='+transaction.url.searchParams.get('state')+'&code='+code,{headers:{Cookie:transaction.cookie},redirect:'manual'});
}
const provider=await fetch(origin+'/api/auth/google').then(r=>r.json());assert.equal(provider.google,true);
const cross=await fetch(origin+'/api/auth/google',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:'{}'});assert.equal(cross.status,403);
const transaction=await start({cart:[{id:'test-atelier-bag',size:'One size',quantity:1}]});
const missing=await fetch(origin+'/api/auth/google/callback?state='+transaction.url.searchParams.get('state')+'&code=x',{redirect:'manual'});assert.match(missing.headers.get('location'),/auth\/result/);
const completed=await finish(transaction);assert.equal(completed.status,303);assert.equal(completed.headers.get('location'),origin+'/');
const session=completed.headers.getSetCookie().find(s=>s.startsWith('dioka_token=')).split(';')[0];
const me=await fetch(origin+'/api/auth/me',{headers:{Cookie:session}}).then(r=>r.json());assert.equal(me.user.email,'dioka.client@gmail.com');assert.equal(me.user.cart[0].price,125);assert.ok(!('googleSubject' in me.user));
const repeat=await finish(transaction);assert.match(repeat.headers.get('location'),/auth\/result/);assert.ok(!repeat.headers.getSetCookie().some(s=>s.startsWith('dioka_token=')));
for(const overrides of [{nonce:'wrong'},{aud:'another-client'},{email_verified:false},{exp:1}]){const result=await finish(await start(),overrides);assert.match(result.headers.get('location'),/auth\/result/);assert.ok(!result.headers.getSetCookie().some(s=>s.startsWith('dioka_token=')))}
const denied=await finish(await start({returnTo:'/admin'}));assert.match(denied.headers.get('location'),/auth\/result/);assert.ok(!denied.headers.getSetCookie().some(s=>s.startsWith('dioka_token=')));
const impostor=await finish(await start(),{sub:'impostor',email:'owner@example.test'});assert.match(impostor.headers.get('location'),/auth\/result/);
const ownerLogin=await fetch(origin+'/api/auth/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Forwarded-For':'10.9.0.1'},body:JSON.stringify({email:'owner@example.test',password})});assert.equal(ownerLogin.status,200);
const ownerCookie=ownerLogin.headers.getSetCookie()[0].split(';')[0];
const linked=await finish(await start({returnTo:'/admin',cookie:ownerCookie,connect:true}),{sub:'owner-google',email:'owner@example.test'});assert.equal(linked.headers.get('location'),origin+'/admin');
const linkedCookie=linked.headers.getSetCookie().find(s=>s.startsWith('dioka_token=')).split(';')[0];assert.equal((await fetch(origin+'/api/admin',{headers:{Cookie:linkedCookie}})).status,200);
const ownerAgain=await finish(await start({returnTo:'/admin'}),{sub:'owner-google',email:'owner@example.test'});assert.equal(ownerAgain.headers.get('location'),origin+'/admin');
const takeover=await finish(await start(),{sub:'different-google',email:'owner@example.test'});assert.match(takeover.headers.get('location'),/auth\/result/);
console.log('PASS Google: signed identity verification, PKCE, state/cookie binding, one-time callbacks, nonce/audience/expiry/email checks, guest bag preservation and admin protection');
}
