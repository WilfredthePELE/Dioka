"use client";
import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store-context";
export function ClearPaidCart({ sessionId }: { sessionId: string }) { const { clearCart, authLoading, user } = useStore(); const done = useRef(false); useEffect(() => { if (!done.current && !authLoading) { done.current = true; try { if (localStorage.getItem("dioka_checkout_session") === sessionId) { localStorage.removeItem("dioka_checkout_session"); if (!user) clearCart(); } } catch {} } }, [clearCart, sessionId, authLoading, user]); return null; }
