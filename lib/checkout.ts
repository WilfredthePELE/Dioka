import type { StoreOrder } from "@/lib/orders";
export interface CheckoutAttempt { fingerprint:string;items:StoreOrder["items"];userId:string|null;email:string;reservationId:string;status:"processing"|"retry"|"ready"|"failed";lease:string;updatedAt:number;createdAt:number;expiresAt:number;stripeBody?:string;sessionId?:string;url?:string }
export function checkoutParameters(attempt:CheckoutAttempt){
 const origin=new URL(process.env.DIOKA_SITE_URL!).origin,params=new URLSearchParams({mode:"payment",success_url:origin+"/order-confirmation?session_id={CHECKOUT_SESSION_ID}",cancel_url:origin+"/cart?checkout=cancelled",billing_address_collection:"required","phone_number_collection[enabled]":"true"});
 params.set("expires_at",String(Math.floor(attempt.expiresAt/1000)));params.set("metadata[dioka_reservation]",attempt.reservationId);params.set("payment_method_types[0]","card");
 if(attempt.userId){params.set("customer_email",attempt.email);params.set("client_reference_id",attempt.userId)}
 ["US","GB","NG","CA","AU","IT","FR","DE"].forEach((country,i)=>params.set("shipping_address_collection[allowed_countries]["+i+"]",country));
 attempt.items.forEach((item,i)=>{const prefix="line_items["+i+"]";params.set(prefix+"[price_data][currency]","usd");params.set(prefix+"[price_data][unit_amount]",String(Math.round(item.price*100)));params.set(prefix+"[price_data][product_data][name]",item.name+" · "+item.size);params.set(prefix+"[quantity]",String(item.quantity));const details=[item.color,item.leather,item.shape,item.monogram?"Monogram: "+item.monogram:"",item.designReference?"Private design reference attached":""].filter(Boolean).join(" · ");if(details)params.set(prefix+"[price_data][product_data][description]",details)});return params.toString();
}
