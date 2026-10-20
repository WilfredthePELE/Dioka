"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  products as defaultProducts,
  type Product,
  type Currency,
  CURRENCY_CONFIG,
  formatPrice as formatPriceWithConfig,
} from "@/lib/products";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  size: string;
  quantity: number;
  addedAt?: string;
  color?: string;
  leather?: string;
  shape?: string;
  monogram?: string;
  itemKey?: string;
}

export interface UserProfile {
  googleConnected?: boolean;
  administrator?: boolean;
  id: string;
  name: string;
  email: string;
  createdAt: string;
  tier?: string;
  shippingAddress?: {
    fullName?: string;
    street?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
  };
  cart?: CartItem[];
  wishlist?: string[];
  orders?: Array<{
    orderId: string;
    items: CartItem[];
    subtotal: number;
    total: number;
    currency: string;
    status: string;
    trackingCode: string;
    createdAt: string;
  }>;
}

interface StoreContextType {
  catalog: Product[];
  catalogLoaded: boolean;
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amount: number) => string;
  exchangeRates: Record<Currency, number>;
  isRatesLoading: boolean;
  lastRatesUpdated: string;
  refreshRates: () => Promise<void>;
  currencyConverterModalOpen: boolean;
  setCurrencyConverterModalOpen: (open: boolean) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string, e?: React.MouseEvent) => void;
  addToCart: (
    product: Product,
    size?: string,
    quantity?: number,
    customization?: {
      color?: string;
      leather?: string;
      shape?: string;
      monogram?: string;
    }
  ) => void;
  changeQuantity: (idOrKey: string, size?: string, delta?: number) => void;
  removeFromCart: (idOrKey: string, size?: string) => void;
  clearCart: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  orderTrackingOpen: boolean;
  setOrderTrackingOpen: (open: boolean) => void;
  sizeGuideOpen: boolean;
  setSizeGuideOpen: (open: boolean) => void;
  checkoutModalOpen: boolean;
  setCheckoutModalOpen: (open: boolean) => void;

  // Master Designer Consultation Chatbox
  designerChatOpen: boolean;
  setDesignerChatOpen: (open: boolean) => void;

  // Supabase Backend Modal & Integration
  supabaseModalOpen: boolean;
  setSupabaseModalOpen: (open: boolean) => void;
  isSupabaseActive: boolean;

  // User Authentication & Specialized Backend Cart
  user: UserProfile | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  accountModalOpen: boolean;
  setAccountModalOpen: (open: boolean) => void;
  accountModalTab: "login" | "register" | "profile";
  setAccountModalTab: (tab: "login" | "register" | "profile") => void;
  isCartSyncing: boolean;
  syncCartToBackend: (newCart: CartItem[]) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

const DEFAULT_EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: CURRENCY_CONFIG.EUR.rate,
  GBP: CURRENCY_CONFIG.GBP.rate,
  NGN: CURRENCY_CONFIG.NGN.rate,
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [catalog, setCatalog] = useState<Product[]>(defaultProducts);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [catalogError, setCatalogError] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>(DEFAULT_EXCHANGE_RATES);
  const [isRatesLoading, setIsRatesLoading] = useState(false);
  const [lastRatesUpdated, setLastRatesUpdated] = useState<string>(new Date().toISOString());
  const [currencyConverterModalOpen, setCurrencyConverterModalOpen] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderTrackingOpen, setOrderTrackingOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [designerChatOpen, setDesignerChatOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const isSupabaseActive = false;

  // User Auth & Specialized Cart State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<"login" | "register" | "profile">("login");
  const [isCartSyncing, setIsCartSyncing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const isInitialSync = useRef(true);

  // Set currency with localStorage persistence
  const setCurrency = useCallback((newCurr: Currency) => {
    setCurrencyState(newCurr);
    if (typeof window !== "undefined") {
      localStorage.setItem("dioka-currency", newCurr);
    }
  }, []);

  // Show Toast
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr));
    }, 3500);
  }, []);

  // Fetch real-time exchange rates
  const refreshRates = useCallback(async () => {
    setIsRatesLoading(true);
    try {
      const res = await fetch("/api/currency/rates");
      if (res.ok) {
        const data = await res.json();
        if (data.rates) {
          setExchangeRates({
            USD: 1,
            EUR: data.rates.EUR || DEFAULT_EXCHANGE_RATES.EUR,
            GBP: data.rates.GBP || DEFAULT_EXCHANGE_RATES.GBP,
            NGN: data.rates.NGN || DEFAULT_EXCHANGE_RATES.NGN,
          });
          setLastRatesUpdated(data.lastUpdated || new Date().toISOString());
        }
      }
    } catch {
      // Keep existing rates
    } finally {
      setIsRatesLoading(false);
    }
  }, []);

  // Fetch live exchange rates on mount and check Supabase status
  useEffect(() => {
    let active = true;
    fetch("/api/currency/rates")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.rates) return;
        setExchangeRates({
          USD: 1,
          EUR: data.rates.EUR || DEFAULT_EXCHANGE_RATES.EUR,
          GBP: data.rates.GBP || DEFAULT_EXCHANGE_RATES.GBP,
          NGN: data.rates.NGN || DEFAULT_EXCHANGE_RATES.NGN,
        });
        setLastRatesUpdated(data.lastUpdated || new Date().toISOString());
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Fetch live products if available
  useEffect(() => {
    fetch("/api/products")
      .then((res) => { if (!res.ok) throw new Error("Catalogue unavailable."); return res.json(); })
      .then((data: { products?: Product[] }) => {
        if (data.products && Array.isArray(data.products)) {
          setCatalog(data.products);
        }
      })
      .catch(() => { setCatalogError(true); setCatalog([]); })
      .finally(() => setCatalogLoaded(true));
  }, []);

  // Sync the signed-in shopper's cart through the server API.
  const syncCartToBackend = useCallback(async (currentCart: CartItem[]) => {
    const timer = setTimeout(() => setIsCartSyncing(true), 0);
    try {
      // 1. Sync to local backend API
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: currentCart }),
      });

    } catch {
      // offline fallback
    } finally {
      clearTimeout(timer);
      setIsCartSyncing(false);
    }
  }, [user]);

  // Check auth session on mount & load user's specialized cart
  useEffect(() => {
    let mounted = true;
    async function checkAuthSession() {
      try {
        setAuthLoading(true);
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user && mounted) {
            setUser(data.user);

            if (Array.isArray(data.user.cart)) {
              setCart(data.user.cart);
            }
            if (Array.isArray(data.user.wishlist) && data.user.wishlist.length > 0) {
              setWishlist(data.user.wishlist);
            }
            setLoaded(true);
            setAuthLoading(false);
            return;
          }
        }
      } catch {
        // Fall back to guest storage
      }

      // Guest hydration from localStorage
      if (mounted) {
        try {
          const savedCart = localStorage.getItem("dioka-cart-guest");
          if (savedCart) {
            const parsed = JSON.parse(savedCart);
            if (Array.isArray(parsed)) {
              setCart(parsed);
            }
          }
          const savedWishlist = localStorage.getItem("dioka-wishlist");
          if (savedWishlist) {
            const parsed = JSON.parse(savedWishlist);
            if (Array.isArray(parsed)) {
              setWishlist(parsed);
            }
          }
          const savedCurr = localStorage.getItem("dioka-currency") as Currency;
          if (savedCurr && CURRENCY_CONFIG[savedCurr]) {
            setCurrencyState(savedCurr);
          }
        } catch {
          // ignore parsing error
        }
        setLoaded(true);
        setAuthLoading(false);
      }
    }

    checkAuthSession();
    return () => {
      mounted = false;
    };
  }, []);

  // Save cart to storage and sync specialized cart to backend on change
  useEffect(() => {
    if (!loaded) return;

    if (isInitialSync.current) {
      isInitialSync.current = false;
      return;
    }

    if (user) {
      try {
        localStorage.setItem(`dioka-cart-${user.id}`, JSON.stringify(cart));
      } catch {}
      syncCartToBackend(cart);
    } else {
      try {
        localStorage.setItem("dioka-cart-guest", JSON.stringify(cart));
      } catch {}
    }
  }, [cart, user, loaded, syncCartToBackend]);

  // Save wishlist to localStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("dioka-wishlist", JSON.stringify(wishlist));
    } catch {}
  }, [wishlist, loaded]);

  // Auth: Login function
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: pass,
          incomingCart: cart,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed. Please verify credentials." };
      }

      setUser(data.user);
      if (Array.isArray(data.user.cart)) {
        setCart(data.user.cart);
      }
      showToast(`Welcome back, ${data.user.name.split(" ")[0]}! Specialized bag loaded.`);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      return { success: false, error: msg };
    }
  };

  // Auth: Register function
  const register = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password: pass,
          initialCart: cart,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to create account." };
      }

      setUser(data.user);
      if (Array.isArray(data.user.cart)) {
        setCart(data.user.cart);
      }
      showToast(`Welcome to Dioka Atelier, ${name.split(" ")[0]}! Specialized bag created.`);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      return { success: false, error: msg };
    }
  };

  // Auth: Logout function
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}

    setUser(null);
    try {
      const guestCart = localStorage.getItem("dioka-cart-guest");
      setCart(guestCart ? JSON.parse(guestCart) : []);
    } catch {
      setCart([]);
    }
    showToast("Signed out. Switched to guest shopping bag.");
  };

  // Format price helper with real-time exchange rates
  const formatPrice = useCallback((amountInUSD: number): string => {
    return formatPriceWithConfig(amountInUSD, currency, exchangeRates);
  }, [currency, exchangeRates]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (catalog.find(p => p.id === item.id)?.price ?? item.price ?? 0) * item.quantity, 0);

  // Add to cart with specialized feedback & bespoke customizations
  const addToCart = (
    product: Product,
    size?: string,
    quantity: number = 1,
    customization?: {
      color?: string;
      leather?: string;
      shape?: string;
      monogram?: string;
    }
  ) => {
    if (product.inStock === false || (product.stockQuantity ?? 10) < 1) { showToast("This piece is currently unavailable."); return; }
    quantity = Math.max(1, Math.min(10, product.stockQuantity ?? 10, Math.floor(quantity)));
    const finalSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : "One size");
    const finalColor = customization?.color || product.color || "Cognac";
    const finalLeather = customization?.leather || "Full-Grain";
    const finalShape = customization?.shape || "The Classic";
    const finalMonogram = customization?.monogram || "";
    const itemKey = `${product.id}__${finalSize}__${finalColor}__${finalLeather}__${finalShape}__${finalMonogram}`;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.itemKey === itemKey ||
          (item.id === product.id &&
            item.size === finalSize &&
            (item.color || "") === finalColor &&
            (item.leather || "") === finalLeather &&
            (item.shape || "") === finalShape &&
            (item.monogram || "") === finalMonogram)
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: Math.min(10, product.stockQuantity ?? 10, next[existingIdx].quantity + quantity),
        };
        return next;
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          size: finalSize,
          quantity,
          addedAt: new Date().toISOString(),
          color: finalColor,
          leather: finalLeather,
          shape: finalShape,
          monogram: finalMonogram,
          itemKey,
        },
      ];
    });

    const userMsg = user
      ? `Added to ${user.name.split(" ")[0]}'s bag (${finalColor} · ${finalLeather})`
      : `Added to bag (${finalColor} · ${finalLeather})`;
    showToast(userMsg);
    setCartOpen(true);
  };

  const changeQuantity = (idOrKey: string, size?: string, delta: number = 1) => {
    setCart((prev) =>
      prev
        .map((item) => {
          const matches =
            item.itemKey === idOrKey ||
            (item.id === idOrKey && (!size || item.size === size));
          if (matches) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: Math.min(10, catalog.find(p => p.id === item.id)?.stockQuantity ?? 10, nextQty) } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (idOrKey: string, size?: string) => {
    setCart((prev) =>
      prev.filter((item) => {
        if (item.itemKey && item.itemKey === idOrKey) return false;
        if (item.id === idOrKey && (!size || item.size === size)) return false;
        return true;
      })
    );
    showToast("Item removed from bag");
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const isAdding = !wishlist.includes(productId);
    setWishlist((prev) => (isAdding ? [...prev, productId] : prev.filter((id) => id !== productId)));
    const item = catalog.find((p) => p.id === productId);
    if (item) {
      showToast(isAdding ? `Saved ${item.name} to favorites` : `Removed ${item.name} from favorites`);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        catalog,
        catalogLoaded,
        cart,
        cartCount,
        subtotal,
        currency,
        setCurrency,
        formatPrice,
        exchangeRates,
        isRatesLoading,
        lastRatesUpdated,
        refreshRates,
        currencyConverterModalOpen,
        setCurrencyConverterModalOpen,
        cartOpen,
        setCartOpen,
        wishlist,
        toggleWishlist,
        addToCart,
        changeQuantity,
        removeFromCart,
        clearCart,
        toast,
        showToast,
        selectedProduct,
        setSelectedProduct,
        orderTrackingOpen,
        setOrderTrackingOpen,
        sizeGuideOpen,
        setSizeGuideOpen,
        checkoutModalOpen,
        setCheckoutModalOpen,
        designerChatOpen,
        setDesignerChatOpen,
        supabaseModalOpen,
        setSupabaseModalOpen,
        isSupabaseActive,
        user,
        isAuthenticated: Boolean(user),
        authLoading,
        login,
        register,
        logout,
        accountModalOpen,
        setAccountModalOpen,
        accountModalTab,
        setAccountModalTab,
        isCartSyncing,
        syncCartToBackend,
      }}
    >
      {catalogError && <div role="alert" style={{ background: "#fff0eb", color: "#8d3527", padding: "14px 6%", fontSize: 13 }}>The collection could not be loaded. Please refresh shortly or contact our team. Your saved bag has been kept.</div>}
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return ctx;
}
