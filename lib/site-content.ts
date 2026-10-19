import { readState } from "@/lib/persistence";
import { z } from "zod";
export const contentSchema = z.object({
  announcement: z.string().max(240), headline: z.string().trim().min(1).max(140),
  introduction: z.string().max(1000), supportEmail: z.string().email(),
  shippingPolicy: z.string().max(3000), returnsPolicy: z.string().max(3000),
});
export const defaultContent = { announcement: "Thoughtfully made. Made to last.", headline: "The art of everyday elegance.", introduction: "Discover leather bags, footwear and outerwear from Dioka Atelier. Choose your piece, make it yours, and let us take care of the details.", supportEmail: "contactus@diokacraft.com", shippingPolicy: "Contact our team for delivery options and current lead times for your destination.", returnsPolicy: "Contact our team before returning an item. Personalized pieces may have different return conditions." };
export type SiteContent = z.infer<typeof contentSchema>;
export function getContent() { return readState("content", defaultContent); }
