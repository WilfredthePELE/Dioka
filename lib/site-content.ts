import { readState } from "@/lib/persistence";
import { z } from "zod";
import {controlsSchema} from "@/lib/site-controls-schema";
export const contentSchema = z.object({
  announcement: z.string().max(240), headline: z.string().trim().min(1).max(140),
  introduction: z.string().max(1000), supportEmail: z.string().email(),
  privacyPolicy:z.string().max(10000).default("We store account, order and customer-care information to provide our services. Contact our team about your data."),termsPolicy:z.string().max(10000).default("Checkout charges the listed item total in USD. Contact us about delivery, returns and personalized orders before purchasing."),warrantyPolicy:z.string().max(10000).default("Contact our team about product care, repairs and the support available for your piece."),controls:controlsSchema,
  shippingPolicy: z.string().max(3000), returnsPolicy: z.string().max(3000),
});
export const defaultContent = { announcement: "Thoughtfully made. Made to last.", headline: "The art of everyday elegance.", introduction: "Discover leather bags, footwear and outerwear from Dioka Atelier. Choose your piece, make it yours, and let us take care of the details.", supportEmail: "contactus@diokacraft.com", shippingPolicy: "Contact our team for delivery options and current lead times for your destination.", returnsPolicy: "Contact our team before returning an item. Personalized pieces may have different return conditions." };
export type SiteContent = z.infer<typeof contentSchema>;
export async function getContent():Promise<SiteContent>{return contentSchema.parse(await readState("content", defaultContent));}
