"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Send,
  X,
  Minus,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ShoppingBag,
  Check,
  CheckCheck,
  ThumbsUp,
  Paperclip,
  Play,
  Pause,
  Truck,
  Shield,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { products, type Product } from "@/lib/products";

export interface MessengerCard {
  type: "product" | "tracking" | "audio_note" | "swatches" | "consultation";
  product?: Product;
  orderId?: string;
  orderStatus?: string;
  audioDuration?: string;
}

export interface MessengerMessage {
  id: string;
  sender: "dioka" | "client";
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "seen";
  card?: MessengerCard;
}

let msgSequence = 0;
function createMessageId(prefix: string): string {
  msgSequence += 1;
  return `${prefix}-${msgSequence}-${Math.random().toString(36).substring(2, 7)}`;
}

function getFormattedTime(): string {
  try {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "2:45 PM";
  }
}

const INITIAL_MESSENGER_MESSAGES: MessengerMessage[] = [
  {
    id: "dioka-welcome-1",
    sender: "dioka",
    text: "Ciao! Welcome to the Dioka Atelier in Florence. I am Wilfred Owubokiri, Creative Director & Master Artisan.",
    timestamp: "2:40 PM",
    status: "seen",
  },
  {
    id: "dioka-welcome-2",
    sender: "dioka",
    text: "Every piece we make is cut from vegetable-tanned Tuscan calfskin and hand-welted in our workshop. How may our concierge assist your collection today?",
    timestamp: "2:41 PM",
    status: "seen",
    card: {
      type: "audio_note",
      audioDuration: "0:16",
    },
  },
];

const QUICK_REPLIES = [
  { id: "bags", label: "👜 Best Seller Bags", prompt: "What are your most celebrated handcrafted bags?" },
  { id: "boots", label: "👞 Boot Sizing Guide", prompt: "How do your Goodyear-welted Chelsea boots fit?" },
  { id: "tracking", label: "📦 Track Order #DK-9402", prompt: "Can you track my bespoke order #DK-9402?" },
  { id: "monogram", label: "✨ 24k Gold Monogramming", prompt: "Tell me about your complimentary gold foil monogramming." },
  { id: "leather", label: "🌿 Tuscan Leather Origin", prompt: "What kind of leather do you use for your bags and boots?" },
  { id: "artisan", label: "💬 Speak with Wilfred", prompt: "I'd like a personal styling recommendation from Master Wilfred." },
];

export function DiokaMessenger() {
  const {
    designerChatOpen,
    setDesignerChatOpen,
    catalog = products,
    addToCart,
    setCartOpen,
    formatPrice,
    showToast,
  } = useStore();

  const [messages, setMessages] = useState<MessengerMessage[]>(INITIAL_MESSENGER_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlayingAudioNote, setIsPlayingAudioNote] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [activeSwatch, setActiveSwatch] = useState<string>("Cognac");

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hydration-safe initial load from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("dioka_messenger_v2");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch {
        // Ignore
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Listen to custom open event
  useEffect(() => {
    const handleOpen = () => {
      setIsMinimized(false);
      setDesignerChatOpen(true);
    };
    window.addEventListener("open-dioka-chat", handleOpen);
    return () => window.removeEventListener("open-dioka-chat", handleOpen);
  }, [setDesignerChatOpen]);

  // Play synthesized messenger pop chime
  const playChime = useCallback((type: "send" | "receive" = "receive") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "receive") {
        // Facebook Messenger incoming message tone
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.18);
      } else {
        // Send pop
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, [soundEnabled]);

  // Persist chat in localStorage
  useEffect(() => {
    try {
      localStorage.setItem("dioka_messenger_v2", JSON.stringify(messages));
    } catch {
      // Ignore
    }
  }, [messages]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (designerChatOpen && !isMinimized && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, designerChatOpen, isMinimized]);

  // Audio note playback simulation
  useEffect(() => {
    if (isPlayingAudioNote) {
      audioIntervalRef.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudioNote(false);
            return 0;
          }
          return prev + 6.25;
        });
      }, 1000);
    } else {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isPlayingAudioNote]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend) return;

    playChime("send");

    const clientMsg: MessengerMessage = {
      id: createMessageId("client"),
      sender: "client",
      text: textToSend,
      timestamp: getFormattedTime(),
      status: "sent",
    };

    setMessages((prev) => [...prev, clientMsg]);
    if (!customText) setInputText("");
    setIsTyping(true);

    // Call server-side concierge route
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply ||
        "Thank you for contacting Dioka Atelier. Master Wilfred and our Tuscan artisans are at your service.";

      // Determine if a rich card should be appended
      let card: MessengerCard | undefined;
      const lower = textToSend.toLowerCase();

      if (lower.includes("bag") || lower.includes("weekender") || lower.includes("duffle") || lower.includes("saddle")) {
        const bagProduct = catalog.find((p) => p.category === "Bags") || catalog[0];
        card = { type: "product", product: bagProduct };
      } else if (lower.includes("boot") || lower.includes("shoe") || lower.includes("chelsea") || lower.includes("derby")) {
        const shoeProduct = catalog.find((p) => p.category === "Footwear") || catalog[3];
        card = { type: "product", product: shoeProduct };
      } else if (lower.includes("track") || lower.includes("dk-") || lower.includes("status") || lower.includes("order")) {
        card = {
          type: "tracking",
          orderId: "DK-9402",
          orderStatus: "In Final Edge Burnishing & Quality Inspection · Florence",
        };
      } else if (lower.includes("leather") || lower.includes("swatch") || lower.includes("hide")) {
        card = { type: "swatches" };
      }

      // Add realistic Messenger typing pause
      setTimeout(() => {
        setIsTyping(false);
        playChime("receive");

        const diokaMsg: MessengerMessage = {
          id: createMessageId("dioka"),
          sender: "dioka",
          text: replyText,
          timestamp: getFormattedTime(),
          status: "seen",
          card,
        };

        setMessages((prev) => {
          // Update client message to 'seen'
          const updated = prev.map((m) =>
            m.id === clientMsg.id ? { ...m, status: "seen" as const } : m
          );
          return [...updated, diokaMsg];
        });
      }, 900);
    } catch {
      setIsTyping(false);
      playChime("receive");
      const fallbackMsg: MessengerMessage = {
        id: createMessageId("dioka"),
        sender: "dioka",
        text: "Our master artisans in Florence are currently tailoring pieces at the bench. How may we guide your selection today?",
        timestamp: getFormattedTime(),
        status: "seen",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  const handleSendThumbsUp = () => {
    handleSend("👍");
  };

  const handleQuickAdd = (p: Product) => {
    addToCart(p);
    setCartOpen(true);
    showToast(`Added ${p.name} to your Dioka shopping bag.`);
  };

  return (
    <>
      {/* FACEBOOK MESSENGER FULL CONVERSATION WINDOW (Triggered only from Navbar) */}
      {designerChatOpen && (
        <aside
          role="dialog"
          aria-label="Dioka Atelier Facebook Messenger Chat"
          style={{
            position: "fixed",
            bottom: isMinimized ? "0px" : "20px",
            right: "20px",
            width: isExpanded ? "min(520px, calc(100vw - 32px))" : "min(400px, calc(100vw - 32px))",
            height: isMinimized ? "58px" : isExpanded ? "min(780px, calc(100vh - 40px))" : "min(630px, calc(100vh - 40px))",
            background: "#ffffff",
            borderRadius: isMinimized ? "16px 16px 0 0" : "18px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.22), 0 4px 16px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            fontFamily: "var(--dioka-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          {/* MESSENGER TOP BAR HEADER */}
          <div
            style={{
              padding: "12px 16px",
              background: "#ffffff",
              borderBottom: "1px solid #ebe6df",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: isMinimized ? "pointer" : "default",
              userSelect: "none",
            }}
            onClick={() => {
              if (isMinimized) setIsMinimized(false);
            }}
          >
            {/* Dioka Avatar & Status */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #123d32 0%, #2b705e 100%)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "15px",
                  position: "relative",
                  boxShadow: "0 2px 8px rgba(18, 61, 50, 0.2)",
                  flexShrink: 0,
                }}
              >
                D
                <span
                  style={{
                    position: "absolute",
                    bottom: "0px",
                    right: "0px",
                    width: "11px",
                    height: "11px",
                    borderRadius: "50%",
                    background: "#22c55e",
                    border: "2px solid #ffffff",
                  }}
                  title="Active now"
                />
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "#050505",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    lineHeight: 1.2,
                  }}
                >
                  <span>Dioka Atelier</span>
                  <span
                    style={{
                      fontSize: "10px",
                      background: "#e8f5e9",
                      color: "#166534",
                      padding: "1px 6px",
                      borderRadius: "10px",
                      fontWeight: 600,
                    }}
                  >
                    Florence
                  </span>
                </div>
                <div style={{ fontSize: "11.5px", color: "#65676b", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
                  <span>Active now · Replies instantly</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Sound, Fullscreen, Minimize, Close */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {/* Sound toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSoundEnabled(!soundEnabled);
                }}
                style={{
                  background: "none",
                  border: 0,
                  color: soundEnabled ? "#0084ff" : "#9ca3af",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "50%",
                  display: "flex",
                }}
                title={soundEnabled ? "Mute notifications" : "Enable notification sound"}
                aria-label="Toggle sound"
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* Expand / Collapse size */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                  if (isMinimized) setIsMinimized(false);
                }}
                style={{
                  background: "none",
                  border: 0,
                  color: "#65676b",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "50%",
                  display: "flex",
                }}
                title={isExpanded ? "Standard view" : "Expand window"}
                aria-label="Toggle window size"
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              {/* Minimize */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                style={{
                  background: "none",
                  border: 0,
                  color: "#65676b",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "50%",
                  display: "flex",
                }}
                title={isMinimized ? "Open chat" : "Minimize chat"}
                aria-label="Minimize"
              >
                <Minus size={16} />
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDesignerChatOpen(false);
                }}
                style={{
                  background: "none",
                  border: 0,
                  color: "#65676b",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "50%",
                  display: "flex",
                }}
                title="Close chat"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* MESSENGER BODY (If not minimized) */}
          {!isMinimized && (
            <>
              {/* SCROLLABLE MESSAGES VIEWPORT */}
              <div
                ref={scrollRef}
                style={{
                  flex: 1,
                  padding: "16px 14px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  background: "#ffffff",
                }}
              >
                {/* CLASSIC FB MESSENGER ATELIER PROFILE BANNER */}
                <div
                  style={{
                    textAlign: "center",
                    padding: "18px 12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderBottom: "1px solid #f0f2f5",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "68px",
                      height: "68px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #123d32 0%, #206050 100%)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--dioka-font), serif",
                      fontSize: "28px",
                      fontWeight: 600,
                      boxShadow: "0 6px 20px rgba(18, 61, 50, 0.2)",
                      marginBottom: "10px",
                    }}
                  >
                    DIOKA
                  </div>

                  <h3
                    style={{
                      margin: "0 0 4px",
                      fontFamily: "var(--dioka-font), serif",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#123d32",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Dioka Bespoke Atelier
                  </h3>

                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: "12px",
                      color: "#65676b",
                      maxWidth: "280px",
                      lineHeight: 1.4,
                    }}
                  >
                    Florence, Italy · Vegetable-Tanned Italian Leather Goods & Goodyear Footwear
                  </p>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#f0f2f5",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#050505",
                    }}
                  >
                    <Shield size={12} color="#123d32" />
                    <span>Official Atelier Verified Concierge</span>
                  </div>
                </div>

                {/* DATE PILL */}
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#8a8d91",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    margin: "4px 0",
                  }}
                >
                  Today
                </div>

                {/* MESSAGE THREAD */}
                {messages.map((msg, index) => {
                  const isClient = msg.sender === "client";
                  const prevMsg = messages[index - 1];
                  const showAvatar = !isClient && (!prevMsg || prevMsg.sender === "client");

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isClient ? "flex-end" : "flex-start",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          gap: "8px",
                          maxWidth: "85%",
                        }}
                      >
                        {!isClient && (
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: "#123d32",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "11px",
                              fontWeight: 700,
                              flexShrink: 0,
                              opacity: showAvatar ? 1 : 0,
                            }}
                          >
                            D
                          </div>
                        )}

                        <div
                          style={{
                            background: isClient
                              ? "linear-gradient(135deg, #0084ff 0%, #006aff 100%)"
                              : "#f0f2f5",
                            color: isClient ? "#ffffff" : "#050505",
                            borderRadius: isClient
                              ? "18px 18px 4px 18px"
                              : "18px 18px 18px 4px",
                            padding: "10px 14px",
                            fontSize: "13.5px",
                            lineHeight: 1.45,
                            wordBreak: "break-word",
                            boxShadow: isClient
                              ? "0 2px 6px rgba(0, 132, 255, 0.22)"
                              : "none",
                          }}
                        >
                          {msg.text}
                        </div>
                      </div>

                      {/* RICH INTERACTIVE CARD (If attached) */}
                      {msg.card && (
                        <div
                          style={{
                            marginLeft: isClient ? 0 : "36px",
                            marginTop: "6px",
                            maxWidth: "88%",
                            width: "100%",
                          }}
                        >
                          {/* 1. AUDIO NOTE CARD */}
                          {msg.card.type === "audio_note" && (
                            <div
                              style={{
                                background: "#f8f9fa",
                                border: "1px solid #e5e7eb",
                                borderRadius: "14px",
                                padding: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => setIsPlayingAudioNote(!isPlayingAudioNote)}
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  background: "#123d32",
                                  color: "#ffffff",
                                  border: 0,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                                aria-label="Play audio note"
                              >
                                {isPlayingAudioNote ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: "2px" }} />}
                              </button>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "#123d32" }}>
                                  Master Wilfred Welcome Note
                                </div>
                                <div
                                  style={{
                                    height: "4px",
                                    background: "#e5e7eb",
                                    borderRadius: "2px",
                                    margin: "6px 0 3px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      background: "#123d32",
                                      width: `${audioProgress}%`,
                                      transition: "width 0.5s linear",
                                    }}
                                  />
                                </div>
                                <div style={{ fontSize: "10.5px", color: "#6b7280", display: "flex", justifyContent: "space-between" }}>
                                  <span>Tuscan Heritage & Craft</span>
                                  <span>{msg.card.audioDuration || "0:16"}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 2. PRODUCT CAROUSEL / CARD */}
                          {msg.card.type === "product" && msg.card.product && (
                            <div
                              style={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "14px",
                                overflow: "hidden",
                                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                              }}
                            >
                              <div style={{ position: "relative", width: "100%", height: "140px", background: "#f5f3ef" }}>
                                <Image
                                  src={msg.card.product.image}
                                  alt={msg.card.product.name}
                                  fill
                                  sizes="300px"
                                  style={{ objectFit: "cover" }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "8px",
                                    right: "8px",
                                    background: "#123d32",
                                    color: "#ffffff",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                  }}
                                >
                                  {formatPrice(msg.card.product.price)}
                                </div>
                              </div>

                              <div style={{ padding: "12px" }}>
                                <div style={{ fontSize: "14px", fontWeight: 700, color: "#123d32", marginBottom: "4px" }}>
                                  {msg.card.product.name}
                                </div>
                                <div style={{ fontSize: "11.5px", color: "#6b7280", lineHeight: 1.4, marginBottom: "10px" }}>
                                  {msg.card.product.subtitle || msg.card.product.description || "Handcrafted vegetable-tanned Tuscan leather piece."}
                                </div>

                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAdd(msg.card!.product!)}
                                    style={{
                                      flex: 1,
                                      background: "#123d32",
                                      color: "#ffffff",
                                      border: 0,
                                      borderRadius: "8px",
                                      padding: "8px 12px",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "6px",
                                    }}
                                  >
                                    <ShoppingBag size={13} />
                                    Add to Bag
                                  </button>

                                  <Link
                                    href={`/${msg.card.product.category.toLowerCase()}`}
                                    style={{
                                      padding: "8px 12px",
                                      background: "#f0f2f5",
                                      color: "#123d32",
                                      borderRadius: "8px",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      textDecoration: "none",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    Details
                                  </Link>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 3. ORDER TRACKING CARD */}
                          {msg.card.type === "tracking" && (
                            <div
                              style={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "14px",
                                padding: "14px",
                                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <Truck size={16} color="#123d32" />
                                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#123d32" }}>
                                    Order #{msg.card.orderId || "DK-9402"}
                                  </span>
                                </div>
                                <span style={{ fontSize: "10.5px", background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>
                                  Atelier Final Phase
                                </span>
                              </div>

                              <div style={{ fontSize: "12px", color: "#4b5563", marginBottom: "12px", lineHeight: 1.4 }}>
                                Status: <strong>{msg.card.orderStatus}</strong>
                              </div>

                              {/* Progress bar steps */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", color: "#6b7280" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#166534" }}>
                                  <Check size={12} strokeWidth={3} />
                                  <span>1. Tuscan Raw Hide Selected & Inspected</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#166534" }}>
                                  <Check size={12} strokeWidth={3} />
                                  <span>2. Hand Skiving & Saddle Stitching</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#b45309", fontWeight: 600 }}>
                                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#b45309" }} />
                                  <span>3. Edge Burnishing & 24k Gold Monogram (Current)</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9ca3af" }}>
                                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#d1d5db" }} />
                                  <span>4. DHL Express International Dispatch</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 4. LEATHER SWATCH CARD */}
                          {msg.card.type === "swatches" && (
                            <div
                              style={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "14px",
                                padding: "12px",
                              }}
                            >
                              <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#123d32", marginBottom: "8px" }}>
                                Tuscan Vegetable-Tanned Colorways
                              </div>
                              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                                {[
                                  { name: "Cognac", color: "#8a4a20" },
                                  { name: "Espresso", color: "#2d1d17" },
                                  { name: "Forest", color: "#14392a" },
                                  { name: "Bordeaux", color: "#541624" },
                                  { name: "Nero", color: "#111111" },
                                ].map((swatch) => (
                                  <button
                                    key={swatch.name}
                                    type="button"
                                    onClick={() => {
                                      setActiveSwatch(swatch.name);
                                      handleSend(`I'm interested in the ${swatch.name} Tuscan leather finish.`);
                                    }}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      gap: "4px",
                                      background: "none",
                                      border: 0,
                                      cursor: "pointer",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: "28px",
                                        height: "28px",
                                        borderRadius: "50%",
                                        background: swatch.color,
                                        border: activeSwatch === swatch.name ? "2.5px solid #123d32" : "1.5px solid #e5e7eb",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                                      }}
                                    />
                                    <span style={{ fontSize: "9.5px", color: "#4b5563" }}>{swatch.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TIMESTAMP & STATUS */}
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#8a8d91",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginTop: "2px",
                          marginRight: isClient ? "4px" : "0",
                          marginLeft: isClient ? "0" : "36px",
                        }}
                      >
                        <span>{msg.timestamp}</span>
                        {isClient && (
                          <span>
                            {msg.status === "seen" ? (
                              <span style={{ color: "#0084ff", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                <CheckCheck size={12} strokeWidth={2.5} /> Seen
                              </span>
                            ) : (
                              <Check size={11} strokeWidth={2} />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* TYPING INDICATOR */}
                {isTyping && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "#123d32",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      D
                    </div>
                    <div
                      style={{
                        background: "#f0f2f5",
                        borderRadius: "18px 18px 18px 4px",
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "#90949c",
                          display: "inline-block",
                          animation: "typingBounce 1.4s infinite ease-in-out both",
                        }}
                      />
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "#90949c",
                          display: "inline-block",
                          animation: "typingBounce 1.4s infinite ease-in-out both 0.2s",
                        }}
                      />
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "#90949c",
                          display: "inline-block",
                          animation: "typingBounce 1.4s infinite ease-in-out both 0.4s",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* QUICK REPLIES HORIZONTAL SCROLL CAROUSEL */}
              <div
                style={{
                  padding: "8px 12px",
                  background: "#ffffff",
                  borderTop: "1px solid #f0f2f5",
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  scrollbarWidth: "none",
                }}
              >
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply.id}
                    type="button"
                    onClick={() => handleSend(reply.prompt)}
                    style={{
                      background: "#f0f2f5",
                      border: "1px solid #e4e6eb",
                      borderRadius: "16px",
                      padding: "6px 12px",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      color: "#050505",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#e4e6eb";
                      e.currentTarget.style.color = "#0084ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f0f2f5";
                      e.currentTarget.style.color = "#050505";
                    }}
                  >
                    {reply.label}
                  </button>
                ))}
              </div>

              {/* MESSENGER INPUT BAR */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                style={{
                  padding: "10px 12px",
                  background: "#ffffff",
                  borderTop: "1px solid #ebe6df",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {/* Simulated attachment / swatch button */}
                <button
                  type="button"
                  onClick={() => handleSend("Can I review the leather swatches and bespoke finishes?")}
                  style={{
                    background: "none",
                    border: 0,
                    color: "#0084ff",
                    cursor: "pointer",
                    padding: "6px",
                    borderRadius: "50%",
                    display: "flex",
                  }}
                  title="Attach swatch query"
                  aria-label="Leather swatches"
                >
                  <Paperclip size={18} />
                </button>

                {/* Input Field */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Message Dioka Atelier..."
                  style={{
                    flex: 1,
                    background: "#f0f2f5",
                    border: 0,
                    borderRadius: "20px",
                    padding: "9px 14px",
                    fontSize: "13.5px",
                    color: "#050505",
                    outline: "none",
                  }}
                />

                {/* Send Button or Thumbs Up (Classic Facebook Messenger signature feature!) */}
                {inputText.trim() ? (
                  <button
                    type="submit"
                    style={{
                      background: "none",
                      border: 0,
                      color: "#0084ff",
                      cursor: "pointer",
                      padding: "6px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.15s",
                    }}
                    title="Send message"
                    aria-label="Send"
                  >
                    <Send size={19} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendThumbsUp}
                    style={{
                      background: "none",
                      border: 0,
                      color: "#0084ff",
                      cursor: "pointer",
                      padding: "6px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.15s",
                    }}
                    title="Send Like"
                    aria-label="Send Thumbs Up"
                  >
                    <ThumbsUp size={20} />
                  </button>
                )}
              </form>
            </>
          )}
        </aside>
      )}

      {/* Embedded CSS for animations */}
      <style jsx global>{`
        @keyframes typingBounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
