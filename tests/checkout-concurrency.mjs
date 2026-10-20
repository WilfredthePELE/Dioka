import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
export async function checkoutConcurrency({origin,admin}){
const piece={id:'checkout-race',name:'Checkout race piece',category:'Bags',price:10,stockQuantity:37,image:'/dioka-brown-bag.webp',position:'center',color:'Cognac',sizes:['One size'],description:'An isolated concurrency test product.'};
assert.equal((await admin.call('/api/products','POST',piece)).status,200);
const body=JSON.stringify({items:[{id:piece.id,size:'One size',quantity:1}]});
const results=await Promise.all(Array.from({length:100},(_,i)=>fetch(origin+'/api/checkout',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Forwarded-For':'198.18.1.'+i,'Idempotency-Key':randomUUID()},body}).then(async r=>({status:r.status,data:await r.json()}))));
assert.equal(results.filter(r=>r.status===200).length,37);assert.equal(results.filter(r=>r.status===400).length,63);
let catalogue=await fetch(origin+'/api/products',{cache:'no-store'}).then(r=>r.json());assert.equal(catalogue.products.find(p=>p.id===piece.id).stockQuantity,0);
for(const [id,name] of [['checkout-retry','Checkout retry piece'],['checkout-timeout','Fixture timeout piece']]){await admin.call('/api/products','POST',{...piece,id,name,stockQuantity:3});const key=randomUUID(),payload=JSON.stringify({items:[{id,size:'One size',quantity:1}]});const send=()=>fetch(origin+'/api/checkout',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Forwarded-For':id,'Idempotency-Key':key},body:payload});const first=await send();assert.equal(first.status,id==='checkout-timeout'?503:200);const second=await send();assert.equal(second.status,200);const secondData=await second.json();if(id==='checkout-retry')assert.equal((await first.json()).sessionId,secondData.sessionId);const third=await send();assert.equal((await third.json()).sessionId,secondData.sessionId);catalogue=await fetch(origin+'/api/products',{cache:'no-store'}).then(r=>r.json());assert.equal(catalogue.products.find(p=>p.id===id).stockQuantity,2);}
console.log('PASS checkout concurrency: 100 overlapping buyers/37 units, stable checkout retries and inventory held across an ambiguous provider timeout');
}
