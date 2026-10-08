"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store-context";
import { CURRENCY_CONFIG, formatPrice, type Currency } from "@/lib/products";
import { ArrowRightLeft, RefreshCw, TrendingUp } from "lucide-react";

interface CurrencyConverterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CurrencyConverterModal({ open, onOpenChange }: CurrencyConverterModalProps) {
  const { currency, setCurrency, exchangeRates, isRatesLoading, refreshRates, lastRatesUpdated } = useStore();
  const [calcAmount, setCalcAmount] = useState<number>(285);
  const [fromCurrency, setFromCurrency] = useState<Currency>("USD");

  const currencies: Currency[] = ["USD", "EUR", "GBP", "NGN"];

  // Calculate equivalent in all other currencies
  const usdEquivalent = fromCurrency === "USD" ? calcAmount : calcAmount / (exchangeRates[fromCurrency] || 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: "520px", background: "#fff", color: "#111", padding: "28px" }}>
        <DialogHeader>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(18, 61, 50, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#123d32",
                }}
              >
                <ArrowRightLeft size={18} />
              </div>
              <div>
                <DialogTitle style={{ fontFamily: "var(--dioka-font)", fontSize: "22px", margin: 0 }}>
                  Real-Time Currency Converter
                </DialogTitle>
                <DialogDescription style={{ fontSize: "12px", color: "#666" }}>
                  Instant synchronized rates for Naira (₦), US Dollar ($), Euro (€), and Pound (£).
                </DialogDescription>
              </div>
            </div>

            <button
              type="button"
              onClick={refreshRates}
              disabled={isRatesLoading}
              title="Refresh live exchange rates"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "none",
                border: "1px solid #d4cdc5",
                borderRadius: "3px",
                padding: "6px 10px",
                fontSize: "11px",
                fontWeight: 600,
                color: "#123d32",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={12} className={isRatesLoading ? "animate-spin" : ""} />
              {isRatesLoading ? "Syncing..." : "Sync Live"}
            </button>
          </div>
        </DialogHeader>

        {/* Active Store Currency Selector */}
        <div
          style={{
            background: "#f8f6f3",
            padding: "12px 16px",
            borderRadius: "4px",
            border: "1px solid #e7e2db",
            marginTop: "6px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#123d32" }}>
              Active Shopping Currency
            </span>
            <span style={{ fontSize: "11px", color: "#666" }}>
              Applied across all products & bag
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {currencies.map((curr) => {
              const active = currency === curr;
              const meta = CURRENCY_CONFIG[curr];
              return (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrency(curr)}
                  style={{
                    padding: "10px 8px",
                    borderRadius: "4px",
                    border: active ? "2px solid #123d32" : "1px solid #d4cdc5",
                    background: active ? "#123d32" : "#fff",
                    color: active ? "#fff" : "#111",
                    cursor: "pointer",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>{meta.flag}</span>
                  <span>{curr} ({meta.symbol})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Calculator Sandbox */}
        <div style={{ marginTop: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "#123d32",
              marginBottom: "6px",
            }}
          >
            Live Calculation Sandbox
          </label>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <input
                type="number"
                min="1"
                step="5"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Math.max(0, Number(e.target.value)))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "16px",
                  fontWeight: 600,
                  border: "1px solid #d4cdc5",
                  borderRadius: "3px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ width: "120px" }}>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value as Currency)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "1px solid #d4cdc5",
                  borderRadius: "3px",
                  background: "#fff",
                  boxSizing: "border-box",
                }}
              >
                {currencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr} ({CURRENCY_CONFIG[curr].symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Real-Time Conversion Results Grid */}
        <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {currencies.map((targetCurr) => {
            const meta = CURRENCY_CONFIG[targetCurr];
            const converted = formatPrice(usdEquivalent, targetCurr, exchangeRates);
            const rate = exchangeRates[targetCurr] || meta.rate;

            return (
              <div
                key={targetCurr}
                style={{
                  background: "#fff",
                  border: targetCurr === currency ? "1.5px solid #123d32" : "1px solid #e0dad3",
                  padding: "12px 14px",
                  borderRadius: "4px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#777" }}>
                    {meta.flag} {meta.name}
                  </span>
                  {targetCurr === currency && (
                    <span
                      style={{
                        fontSize: "9px",
                        background: "rgba(18, 61, 50, 0.12)",
                        color: "#123d32",
                        padding: "2px 5px",
                        borderRadius: "2px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginTop: "4px" }}>
                  {converted}
                </div>
                <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                  Rate: 1 USD = {meta.symbol}{new Intl.NumberFormat("en-US").format(rate)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live sync footnote */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "16px",
            paddingTop: "12px",
            borderTop: "1px solid #eee",
            fontSize: "11px",
            color: "#666",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <TrendingUp size={13} color="#123d32" />
            Live sync: 1 USD = ₦{new Intl.NumberFormat("en-US").format(exchangeRates.NGN || 1485)} NGN
          </span>
          <span>Updated: {new Date(lastRatesUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
