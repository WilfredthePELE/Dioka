import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
export async function loadCheckout({origin,admin}) {
 if(new URL(origin).hostname!=='127.0.0.1')throw new Error('Load fixture is restricted to the local integration server');
 const total=10000,concurrency=100,stock=5000,id='load-test-piece';
 assert.equal((await admin.call('/api/products','POST',{id,name:'Isolated load fixture',category:'Bags',price:10,stockQuantity:stock,image:'/dioka-brown-bag.webp',position:'center',color:'Cognac',sizes:['One size'],description:'A local test-only catalogue entry.'})).status,200);
 let next=0;const statuses={},times=[];const start=performance.now();
 await Promise.all(Array.from({length:concurrency},async()=>{while(next<total){const number=next++,started=performance.now();const response=await fetch(origin+'/api/checkout',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Forwarded-For':'load-'+number,'Idempotency-Key':randomUUID()},body:JSON.stringify({items:[{id,size:'One size',quantity:1}]})});await response.text();statuses[response.status]=(statuses[response.status]||0)+1;times.push(performance.now()-started);}}));
 times.sort((a,b)=>a-b);const product=(await admin.call('/api/admin')).data.products.find(p=>p.id===id);const report={totalRequests:total,maximumInFlight:concurrency,initialStock:stock,remainingStock:product.stockQuantity,statuses,durationSeconds:(performance.now()-start)/1000,p50ms:times[Math.floor(total*.5)],p95ms:times[Math.floor(total*.95)],p99ms:times[Math.floor(total*.99)],scope:'Single local Node process, SQLite, deterministic payment fixture. Not a 10000 simultaneous-user production capacity certification.'};
 await writeFile('test-results/load-checkout.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));assert.equal(statuses[200],stock);assert.equal(statuses[400],total-stock);assert.equal(product.stockQuantity,0);
}
