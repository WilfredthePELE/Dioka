import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const DIOKA_CATALOG_CONTEXT = `
DIOKA ATELIER CATALOG & HERITAGE CONTEXT:
Dioka is an artisanal luxury leather goods and bespoke footwear house founded with heritage workshops in Florence, Italy.
Every piece is cut from prime Tuscan vegetable-tanned full-grain calfskin and drum-dyed French lambskin.
Construction details:
- Shoes & Boots: Hand-welted Goodyear construction, resolable, stacked leather and Cuban heels, cushioned cork beds.
- Handbags & Duffles: Hand-burnished edges, bonded linen saddle-stitching, solid antiqued brass hardware, suede-lined interiors.
- Jackets & Outerwear: Ultra-supple drum-dyed lambskin, shearling lining, Italian horn buttons.
- Bespoke Personalization: 24k gold leaf monograms, custom sizing, leather patina choices (Cognac, Espresso, Forest, Bordeaux, Nero).

CURRENT SIGNATURE PIECES:
1. Arc Shoulder Bag ($580 / €540) - Sculptural curved calfskin silhouette, magnetic flap, solid brass hardware.
2. Tuscan Saddle Bag ($520 / €480) - Equestrian-inspired saddle bag, hand-burnished raw edges, adjustable shoulder strap.
3. Voyager Leather Weekender Duffle ($780 / €720) - Spacious 48-hour travel bag, reinforced base, brass feet, removable strap.
4. Column Chelsea Boot ($680 / €630) - Goodyear-welted, elastic gussets, pull tabs, hand-buffed calfskin.
5. Florentine Derby Shoe ($620 / €575) - Sleek 5-eyelet blucher, Goodyear welt, stacked heel, resolable.
6. Lambskin Flight Aviator Jacket ($1,250 / €1,160) - Heavyweight merino shearling collar, drum-dyed lambskin, antique brass zip.
7. Double-Breasted Leather Trench ($1,480 / €1,380) - Full-length lambskin trench, storm flap, horn buckles.

POLICIES:
- Shipping: Complimentary DHL Express worldwide on all orders. Delivered in 2-4 business days.
- Craftsmanship Guarantee: Lifetime warranty on all stitching, welts, and hardware.
- Returns & Exchanges: 30-day complimentary return window in original unworn condition.
- Order Tracking: Order IDs follow the pattern DK-XXXX (e.g. DK-9402).
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const formattedHistory = Array.isArray(history)
          ? history.slice(-6).map((m: { sender: string; text: string }) => ({
              role: m.sender === "client" ? "user" : "model",
              parts: [{ text: m.text }],
            }))
          : [];

        const systemPrompt = `You are Wilfred Owubokiri, Master Artisan, Creative Director, and Personal Concierge at Dioka Atelier (Florence, Italy).
You are speaking directly with a valued client on the Dioka Facebook Messenger concierge.

Persona:
- Warm, refined, knowledgeable, passionate about artisanal leathercraft, shoemaking, and timeless style.
- Helpful and concise (keep replies between 2 to 4 sentences, ideal for Messenger chat bubbles).
- When relevant, recommend specific Dioka pieces (Arc Shoulder Bag, Tuscan Saddle Bag, Voyager Weekender, Column Chelsea Boot, Florentine Derby Shoe, Lambskin Flight Jacket).
- Provide sizing advice, leather care recommendations, or bespoke customization details (gold foil monograms, Tuscan vegetable tanning).
- End with an inviting touch or a question.

${DIOKA_CATALOG_CONTEXT}`;

        const chat = ai.chats.create({
          model: "gemini-3.8-flash",
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            maxOutputTokens: 300,
          },
          history: formattedHistory,
        });

        const response = await chat.sendMessage({
          message: message,
        });

        const replyText = response.text || "";

        return NextResponse.json({
          reply: replyText.trim(),
          source: "gemini",
        });
      } catch (geminiError) {
        console.warn("Gemini call failed, falling back to intelligent concierge:", geminiError);
      }
    }

    // Intelligent built-in concierge engine
    const reply = generateAtelierFallbackReply(message);
    return NextResponse.json({
      reply,
      source: "concierge-engine",
    });
  } catch (error) {
    console.error("Error in concierge chat route:", error);
    return NextResponse.json(
      {
        reply:
          "Welcome to the Dioka Atelier. Master Wilfred is currently inspecting our vegetable-tanned hides in Florence. How may our concierge team assist your collection today?",
      },
      { status: 200 }
    );
  }
}

function generateAtelierFallbackReply(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("bag") || q.includes("duffle") || q.includes("tote") || q.includes("saddle") || q.includes("weekender")) {
    return "Our leather bags are cut from full-grain Tuscan calfskin, tanned using vegetable extracts that develop a rich, luminous patina over time. The Voyager Weekender ($780) is our most celebrated travel piece, while the Arc Shoulder Bag ($580) offers an architectural silhouette for daily elegance. Would you like me to recommend a specific color or size?";
  }

  if (q.includes("boot") || q.includes("shoe") || q.includes("derby") || q.includes("chelsea") || q.includes("size") || q.includes("sizing")) {
    return "Every Dioka shoe and boot is crafted with traditional Goodyear-welted resolable construction on hand-carved Florentine lasts. Our sizing runs true to European standards (IT/EU 39–46). If you wear half sizes, we recommend sizing down for Chelsea Boots for an immaculate fit. Shall I help you determine your exact measurements?";
  }

  if (q.includes("track") || q.includes("order") || q.includes("dk-") || q.includes("status") || q.includes("shipping")) {
    return "All bespoke orders are handcrafted in Florence and dispatched via DHL Express with signature on delivery (typically 2–4 business days). You can track order #DK-9402 right now: it is currently in 'Final Edge Burnishing & Quality Inspection' and will be packed in our linen dustbags for dispatch.";
  }

  if (q.includes("monogram") || q.includes("gold") || q.includes("bespoke") || q.includes("custom") || q.includes("personal")) {
    return "We offer complimentary 24k gold foil and blind debossing for up to 3 initials on all bags and leather goods. Our master artisans hand-set each heated brass stamp in our Florentine workshop. You can preview this directly in our Bespoke Studio or request custom placement right here.";
  }

  if (q.includes("jacket") || q.includes("leather coat") || q.includes("shearling") || q.includes("aviator")) {
    return "Our outerwear is tailored from drum-dyed French lambskin with exceptional softness and drape. The Lambskin Flight Aviator Jacket features plush Spanish merino shearling, while our Double-Breasted Trench offers an effortless silhouette. Which cut captures your personal aesthetic?";
  }

  if (q.includes("care") || q.includes("clean") || q.includes("water") || q.includes("protect") || q.includes("leather")) {
    return "Vegetable-tanned leather thrives with minimal intervention. We recommend applying our organic beeswax leather balm once every season and allowing rainwater to dry naturally away from direct heat. Would you like us to include a complimentary jar of atelier balm with your order?";
  }

  if (q.includes("return") || q.includes("exchange") || q.includes("guarantee") || q.includes("warranty")) {
    return "We stand behind every stitch with our Lifetime Atelier Guarantee covering stitching, hardware, and structural welting. We also offer 30-day complimentary returns worldwide with DHL pickup from your door.";
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("good morning") || q.includes("good evening")) {
    return "Buon giorno! Welcome to the Dioka Atelier. I am Wilfred Owubokiri, Creative Director. Whether you are exploring our Tuscan bags, Goodyear-welted footwear, or creating a bespoke monogrammed piece, I am delighted to guide you.";
  }

  return "Thank you for reaching out to the Dioka Atelier. Each piece in our archive is crafted by hand in Florence to stand the test of time. Tell me more about what you are seeking—whether a timeless daily bag, enduring boots, or a bespoke commission.";
}
