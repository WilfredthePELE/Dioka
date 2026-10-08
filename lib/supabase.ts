import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { CartItem } from "@/lib/store-context";

let cachedClient: SupabaseClient | null = null;
let lastUsedConfig = { url: "", key: "" };

/**
 * Get active Supabase configuration from environment variables or browser storage
 */
export function getSupabaseCredentials(): { url: string; key: string } {
  // 1. Environment variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (envUrl && envKey && !envUrl.includes("your-project.supabase.co")) {
    return { url: envUrl, key: envKey };
  }

  // 2. Client-side local storage fallback
  if (typeof window !== "undefined") {
    const localUrl = localStorage.getItem("dioka_supabase_url") || "";
    const localKey = localStorage.getItem("dioka_supabase_anon_key") || "";
    if (localUrl && localKey) {
      return { url: localUrl, key: localKey };
    }
  }

  return { url: envUrl, key: envKey };
}

/**
 * Check if valid Supabase credentials have been provided
 */
export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(
    url &&
    key &&
    url.startsWith("https://") &&
    !url.includes("your-project.supabase.co")
  );
}

/**
 * Get or create Supabase client instance
 */
export function getSupabase(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key || url.includes("your-project.supabase.co")) {
    return null;
  }

  if (cachedClient && lastUsedConfig.url === url && lastUsedConfig.key === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUsedConfig = { url, key };
    return cachedClient;
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    return null;
  }
}

/**
 * Save user-provided credentials from the UI
 */
export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("dioka_supabase_url", url.trim());
    localStorage.setItem("dioka_supabase_anon_key", key.trim());
    cachedClient = null; // Reset client
  }
}

/**
 * Clear stored credentials
 */
export function clearSupabaseCredentials() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("dioka_supabase_url");
    localStorage.removeItem("dioka_supabase_anon_key");
    cachedClient = null;
  }
}

/**
 * Test Supabase connectivity
 */
export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = url && key ? createClient(url, key) : getSupabase();
    if (!client) {
      return { success: false, message: "Missing Supabase Project URL or Anon Key." };
    }

    // Ping auth or table
    const { error } = await client.from("dioka_carts").select("count", { count: "exact", head: true });
    if (error && error.code !== "PGRST116" && !error.message.includes("relation") && !error.message.includes("table")) {
      // If table doesn't exist yet, connection itself succeeded!
      if (error.message.includes("does not exist") || error.code === "42P01") {
        return { success: true, message: "Connected to Supabase! (Tables ready to be created with provided SQL script)." };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: "Successfully connected to Supabase database!" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: msg };
  }
}

/**
 * Sync user's specialized cart to Supabase
 */
export async function syncCartToSupabase(userId: string, items: CartItem[]): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !userId) return false;

  try {
    const storedItems = items.map((item) => ({
      id: item.id,
      size: item.size,
      quantity: item.quantity,
      addedAt: item.addedAt || new Date().toISOString(),
    }));

    const { error } = await supabase.from("dioka_carts").upsert(
      {
        user_id: userId,
        items: storedItems,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.warn("Supabase cart sync note:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase cart sync error:", err);
    return false;
  }
}

/**
 * Fetch specialized cart from Supabase
 */
export async function fetchCartFromSupabase(userId: string): Promise<CartItem[] | null> {
  const supabase = getSupabase();
  if (!supabase || !userId) return null;

  try {
    const { data, error } = await supabase
      .from("dioka_carts")
      .select("items")
      .eq("user_id", userId)
      .single();

    if (error || !data) return null;
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return null;
  }
}

/**
 * Record placed order in Supabase
 */
export async function syncOrderToSupabase(orderData: {
  orderId: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: CartItem[];
  total: number;
  currency: string;
}): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("dioka_orders").insert({
      order_id: orderData.orderId,
      user_id: orderData.userId || null,
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      shipping_address: orderData.shippingAddress,
      items: orderData.items,
      total_amount: orderData.total,
      currency: orderData.currency,
      status: "confirmed",
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("Supabase order sync note:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
