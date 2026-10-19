import { readState, mutateState } from "@/lib/persistence";
import { createHash, randomUUID } from "node:crypto";
export interface ChatMessage { id: string; sender: "client" | "team" | "system"; text: string; createdAt: string }
export interface Conversation { id: string; name: string; email: string; status: "open" | "closed"; messages: ChatMessage[]; updatedAt: string }
export type Inbox = Record<string, Conversation>;
export const conversationId = (token: string) => createHash("sha256").update(token).digest("hex");
export const getInbox = () => readState("inbox", {} as Inbox);
export async function sendCustomerMessage(id: string, message: { id: string; text: string; name?: string; email?: string }) {
  return mutateState("inbox", {} as Inbox, inbox => {
    const now = new Date().toISOString();
    const conversation = inbox[id] ||= { id, name: message.name || "Atelier guest", email: message.email || "", status: "open", messages: [], updatedAt: now };
    if (conversation.messages.some(m => m.id === message.id)) return conversation;
    if (conversation.messages.length >= 1000) throw new Error("This conversation is full. Please contact support.");
    if (message.name) conversation.name = message.name;
    if (message.email) conversation.email = message.email;
    conversation.status = "open";
    conversation.messages.push({ id: message.id, sender: "client", text: message.text, createdAt: now });
    if (conversation.messages.length === 1) conversation.messages.push({ id: randomUUID(), sender: "system", text: "Your message has reached the Dioka team. We will reply here as soon as we can. You can leave an email address so our team has your contact details.", createdAt: now });
    conversation.updatedAt = now; return conversation;
  });
}
