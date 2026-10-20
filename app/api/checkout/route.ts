import {cookies} from "next/headers";
import {randomUUID,createHash} from "node:crypto";
import {assertOrigin,bodyJson,failure,HttpError,limit} from "@/lib/http";
import {getUserFromSession} from "@/lib/auth-storage";
import {validateSelections,checkoutSchema,type CheckoutRecord} from "@/lib/orders";
import {readState,atomicStates,mutateState,incrementLimit,remote,setState} from "@/lib/persistence";
import {reserveInventory,settleInventory} from "@/lib/admin";
import {checkoutParameters,type CheckoutAttempt} from "@/lib/checkout";
const ready=()=>Boolean(process.env.STRIPE_SECRET_KEY&&process.env.STRIPE_WEBHOOK_SECRET&&process.env.DIOKA_SITE_URL&&process.env.DIOKA_STORE_LIVE==="true"&&(process.env.DIOKA_SCALE_MODE!=="true"||(remote&&process.env.DIOKA_TRUST_PROXY==="true")));
export async function GET(){return Response.json({available:ready()},{headers:{"Cache-Control":"no-store"}})}
export async function POST(request:Request){
 let claim:CheckoutAttempt|undefined,attemptKey="",stripeStarted=false,reserved=false,definitive=false;
 const lease=randomUUID();
 try{
  assertOrigin(request);await limit(request,"checkout",15);if(!ready())throw new HttpError(503,"Online payments are not available yet. Please contact our team.");
  const parsed=checkoutSchema.safeParse(await bodyJson(request));if(!parsed.success)throw new HttpError(400,"Please review your bag.");
  const header=request.headers.get("idempotency-key");if(header&&!/^[a-f0-9-]{36}$/i.test(header))throw new HttpError(400,"Invalid checkout request identifier.");
  const user=await getUserFromSession((await cookies()).get("dioka_token")?.value),fingerprint=createHash("sha256").update(JSON.stringify(parsed.data.items)).digest("hex");
  attemptKey="attempt:"+createHash("sha256").update((user?.id||"guest")+":"+(header||randomUUID())).digest("hex");
  const previous=await readState<CheckoutAttempt|null>(attemptKey,null);
  if(previous?.fingerprint&&previous.fingerprint!==fingerprint){definitive=true;throw new HttpError(409,"Your bag changed. Please start a new checkout.");}
  if(previous?.status==="ready"){if(previous.expiresAt<Date.now()){definitive=true;throw new HttpError(409,"This checkout expired. Please start a new checkout.");}return Response.json({url:previous.url,sessionId:previous.sessionId});}
  if(previous?.status==="failed"){definitive=true;throw new HttpError(409,"Please start a new checkout for this bag.");}
  if(previous?.status==="processing"&&Date.now()-previous.updatedAt<40000)throw new HttpError(429,"Your checkout is already being prepared. Please retry shortly.",2);
  const capacity=Math.max(1,Math.min(1000,Number(process.env.DIOKA_CHECKOUT_RATE||20)));
  if(!await incrementLimit("limit:checkout-admission:"+Math.floor(Date.now()/1000),capacity))throw new HttpError(429,"The atelier is busy. Your bag is safe; please retry shortly.",2);
  const items=previous?.items||await validateSelections(parsed.data),now=Date.now();
  claim=await atomicStates({[attemptKey]:null},rows=>{const existing=rows[attemptKey] as CheckoutAttempt|null;if(existing?.status==="ready")return existing;if(existing?.status==="processing"&&Date.now()-existing.updatedAt<40000)throw new HttpError(429,"Your checkout is being prepared. Please retry shortly.",2);const value:CheckoutAttempt={...(existing||{fingerprint,items,userId:user?.id||null,email:user?.email||"",reservationId:randomUUID(),createdAt:now,expiresAt:now+1800000}),status:"processing",lease,updatedAt:now};rows[attemptKey]=value;return value;});
  if(claim.status==="ready")return Response.json({url:claim.url,sessionId:claim.sessionId});
  await reserveInventory(claim.items,claim.reservationId);reserved=true;
  claim.stripeBody ||= checkoutParameters(claim);await mutateState<CheckoutAttempt|null,void>(attemptKey,null,value=>{if(value?.lease===lease)value.stripeBody=claim!.stripeBody;});
  stripeStarted=true;
  const response=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:"Bearer "+process.env.STRIPE_SECRET_KEY,"Content-Type":"application/x-www-form-urlencoded","Idempotency-Key":attemptKey},body:claim.stripeBody,signal:AbortSignal.timeout(20000)});
  if(!response.ok){definitive=response.status>=400&&response.status<500&&response.status!==409;throw new HttpError(response.status===429?429:502,"Payment checkout is busy. Please retry shortly.",response.status===429?3:0);}
  const session=await response.json();if(!session.id||!session.url)throw new Error("Payment provider response was incomplete.");
  const record:CheckoutRecord={sessionId:session.id,reservationId:claim.reservationId,userId:claim.userId,items:claim.items,total:claim.items.reduce((sum,item)=>sum+Math.round(item.price*100)*item.quantity,0)/100,createdAt:new Date().toISOString()};
  await setState("checkout:"+session.id,record);
  await mutateState<CheckoutAttempt|null,void>(attemptKey,null,value=>{if(value&&value.lease===lease)Object.assign(value,{status:"ready",sessionId:session.id,url:session.url,updatedAt:Date.now()});});
  return Response.json({url:session.url,sessionId:session.id});
 }catch(error){
  if(claim?.lease===lease){if(reserved&&(!stripeStarted||definitive))try{await settleInventory(claim.reservationId,false)}catch(releaseError){console.error("Reservation release requires reconciliation",releaseError)}
   try{await mutateState<CheckoutAttempt|null,void>(attemptKey,null,value=>{if(value?.lease===lease&&value.status!=="ready"){value.status=stripeStarted&&!definitive?"retry":"failed";value.updatedAt=Date.now();}})}catch(saveError){console.error("Checkout recovery needs reconciliation",saveError)}
  }
  const response=failure(error);if(definitive||(claim&&!stripeStarted))response.headers.set("X-Checkout-Reset","1");return response;
 }
}
