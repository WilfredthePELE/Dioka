import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireAdmin, assertOrigin, bodyJson, failure, HttpError } from "@/lib/http";
import { adminListProducts } from "@/lib/admin";
import { getContent, contentSchema, defaultContent } from "@/lib/site-content";
import { getInbox, type Inbox } from "@/lib/chat";
import { readState, mutateState } from "@/lib/persistence";
import { listOrders, type StoreOrder } from "@/lib/orders";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await requireAdmin();
    const [products, content, inbox, orders, subscribers] = await Promise.all([adminListProducts(), getContent(), getInbox(), listOrders(), readState("subscribers", {} as Record<string, string>)]);
    return Response.json({ user: { name: user.name, email: user.email }, products, content, conversations: Object.values(inbox).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)), orders: Object.values(orders).sort((a,b) => b.createdAt.localeCompare(a.createdAt)), subscribers }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return failure(e); }
}
const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("content"), content: contentSchema }),
  z.object({ action: z.literal("reply"), conversationId: z.string().regex(/^[a-f0-9]{64}$/), text: z.string().trim().min(1).max(4000), messageId: z.string().uuid() }),
  z.object({ action: z.literal("conversation"), conversationId: z.string().regex(/^[a-f0-9]{64}$/), status: z.enum(["open", "closed"]) }),
  z.object({ action: z.literal("order"), sessionId: z.string().min(1).max(300), status: z.enum(["Confirmed", "Crafting", "Dispatched", "Delivered"]), trackingCode: z.string().max(200) }),
]);
export async function PATCH(request: Request) {
  try {
    assertOrigin(request); await requireAdmin();
    const parsed = actionSchema.safeParse(await bodyJson(request)); if (!parsed.success) throw new HttpError(400, "Please review the form fields.");
    const action = parsed.data;
    if (action.action === "content") await mutateState("content", defaultContent, content => Object.assign(content, action.content));
    if (action.action === "reply" || action.action === "conversation") await mutateState("inbox", {} as Inbox, inbox => {
      const conversation = inbox[action.conversationId]; if (!conversation) throw new HttpError(404, "Conversation not found.");
      if (action.action === "reply") {
        if (!conversation.messages.some(m => m.id === action.messageId)) conversation.messages.push({ id: action.messageId || randomUUID(), sender: "team", text: action.text, createdAt: new Date().toISOString() });
        conversation.status = "open";
      } else conversation.status = action.status;
      conversation.updatedAt = new Date().toISOString();
    });
    if (action.action === "order") await mutateState("orders", {} as Record<string, StoreOrder>, orders => {
      const order = orders[action.sessionId]; if (!order) throw new HttpError(404, "Order not found.");
      if (["Dispatched", "Delivered"].includes(action.status) && !action.trackingCode.trim()) throw new HttpError(400, "Add the shipment tracking reference first.");
      order.status = action.status; order.trackingCode = action.trackingCode;
    });
    return Response.json({ success: true });
  } catch (e) { return failure(e); }
}
