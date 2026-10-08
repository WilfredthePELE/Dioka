import { NextResponse } from "next/server";
import { type Currency } from "@/lib/products";

// Default base rates against 1 USD
const DEFAULT_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1485,
};

export async function GET() {
  try {
    // Attempt live exchange rates with 3.5s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: controller.signal,
      next: { revalidate: 3600 }, // Cache 1 hour
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const liveRates: Record<Currency, number> = {
        USD: 1,
        EUR: Number(data.rates?.EUR?.toFixed(4)) || DEFAULT_RATES.EUR,
        GBP: Number(data.rates?.GBP?.toFixed(4)) || DEFAULT_RATES.GBP,
        NGN: Math.round(Number(data.rates?.NGN)) || DEFAULT_RATES.NGN,
      };

      return NextResponse.json({
        rates: liveRates,
        base: "USD",
        lastUpdated: data.time_last_update_utc || new Date().toISOString(),
        source: "live_exchange_market",
      });
    }
  } catch {
    // Fallback gracefully on timeout/network issue
  }

  return NextResponse.json({
    rates: DEFAULT_RATES,
    base: "USD",
    lastUpdated: new Date().toISOString(),
    source: "atelier_standard_rates",
  });
}
