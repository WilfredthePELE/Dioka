import {createHash} from 'node:crypto';
if(process.env.DIOKA_TEST_SUPABASE!=='1')throw new Error('Supabase fixture is test-only.');
const original=globalThis.fetch,users=new Map();
const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
globalThis.fetch=async(input,init)=>{
 const url=new URL(String(input instanceof Request?input.url:input));
 if(url.hostname!=='dioka-fixture.supabase.co')return original(input,init);
 if(url.pathname==='/auth/v1/token'){
  const body=JSON.parse(init.body),[kind,challenge]=String(body.auth_code||'').split('.');
  if(!body.code_verifier||createHash('sha256').update(body.code_verifier).digest('base64url')!==challenge)return Response.json({msg:'Invalid PKCE verifier',code:'bad_code_verifier'},{status:400});
  const email=kind==='owner'?'owner@example.test':'supabase-shopper@gmail.com',id=kind==='owner'?'00000000-0000-4000-8000-000000000001':'00000000-0000-4000-8000-000000000002';
  const user={id,aud:'authenticated',role:'authenticated',email,email_confirmed_at:new Date().toISOString(),created_at:new Date().toISOString(),app_metadata:{provider:'google',providers:['google']},user_metadata:{email:'owner@example.test',admin:true,role:'admin'},identities:[{id:'identity-'+kind,user_id:id,provider:kind==='wrong-provider'?'email':'google',identity_data:{sub:'google-'+(kind==='owner'?'owner':'shopper'),email,name:kind==='owner'?'Atelier Owner':'Supabase Shopper',email_verified:kind!=='unverified'}}]};
  const access=encode({alg:'HS256',typ:'JWT'})+'.'+encode({sub:id,aud:'authenticated',role:'authenticated',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600})+'.fixture-signature';users.set(access,user);
  return Response.json({access_token:access,refresh_token:'fixture-refresh-token',token_type:'bearer',expires_in:3600,user});
 }
 if(url.pathname==='/auth/v1/user'){const token=new Headers(init?.headers).get('Authorization')?.replace(/^Bearer /,'');return users.has(token)?Response.json(users.get(token)):Response.json({msg:'Unknown user'},{status:401});}
 if(url.pathname==='/auth/v1/logout')return new Response(null,{status:204});
 throw new Error('Unexpected fixture endpoint '+url.pathname);
};
