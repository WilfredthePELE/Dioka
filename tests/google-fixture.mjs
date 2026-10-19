// Test preload only; production code never imports this file.
import {generateKeyPairSync, sign, createHash} from 'node:crypto';
if(process.env.DIOKA_TEST_STRIPE!=='1')throw new Error('Google fixture is test-only');
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const jwk={...publicKey.export({format:'jwk'}),kid:'dioka-test',alg:'RS256',use:'sig'};
const original=globalThis.fetch;
globalThis.fetch=async(input,init)=>{
 const url=String(input instanceof Request?input.url:input);
 if(url==='https://www.googleapis.com/oauth2/v3/certs')return Response.json({keys:[jwk]});
 if(url==='https://oauth2.googleapis.com/token'){
 const params=new URLSearchParams(init.body);let claims;try{claims=JSON.parse(Buffer.from(params.get('code'),'base64url').toString())}catch{return Response.json({}, {status:400})}
 if(createHash('sha256').update(params.get('code_verifier')).digest('base64url')!==claims.challenge)return Response.json({}, {status:400});
 const now=Math.floor(Date.now()/1000);const {challenge,...overrides}=claims;
 const payload={iss:'https://accounts.google.com',aud:process.env.GOOGLE_CLIENT_ID,iat:now,exp:now+3600,email_verified:true,...overrides};
 const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');const body=encode({alg:'RS256',kid:'dioka-test'})+'.'+encode(payload);
 return Response.json({id_token:body+'.'+sign('RSA-SHA256',Buffer.from(body),privateKey).toString('base64url')});
 }
 return original(input,init);
};
