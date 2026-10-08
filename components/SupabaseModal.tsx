"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  testSupabaseConnection,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { CheckCircle2, Copy, Database, ExternalLink, KeyRound, RefreshCw, XCircle } from "lucide-react";

interface SupabaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupabaseModal({ open, onOpenChange }: SupabaseModalProps) {
  const [url, setUrl] = useState(() => getSupabaseCredentials().url);
  const [key, setKey] = useState(() => getSupabaseCredentials().key);
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">(() =>
    isSupabaseConfigured() ? "success" : "idle"
  );
  const [statusMessage, setStatusMessage] = useState(() =>
    isSupabaseConfigured() ? "Supabase credentials configured and active." : ""
  );
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !key) {
      setStatus("error");
      setStatusMessage("Please enter both your Supabase URL and Anon Key.");
      return;
    }

    setStatus("testing");
    setStatusMessage("Testing Supabase connection...");
    saveSupabaseCredentials(url, key);

    const result = await testSupabaseConnection(url, key);
    if (result.success) {
      setStatus("success");
      setStatusMessage(result.message);
    } else {
      setStatus("error");
      setStatusMessage(result.message);
    }
  };

  const handleClear = () => {
    clearSupabaseCredentials();
    setUrl("");
    setKey("");
    setStatus("idle");
    setStatusMessage("Credentials cleared.");
  };

  const sqlSchema = `-- DIOKA SUPABASE TABLES (Copy & Run in Supabase SQL Editor)
create table if not exists public.dioka_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text unique,
  email text not null,
  full_name text,
  created_at timestamptz default now()
);

create table if not exists public.dioka_carts (
  id uuid primary key default gen_random_uuid(),
  user_id text unique not null,
  items jsonb default '[]'::jsonb not null,
  currency text default 'USD' not null,
  updated_at timestamptz default now()
);

create table if not exists public.dioka_orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  user_id text,
  customer_name text not null,
  customer_email text not null,
  shipping_address text not null,
  items jsonb default '[]'::jsonb not null,
  total_amount numeric(12,2) not null,
  currency text default 'USD' not null,
  status text default 'confirmed' not null,
  created_at timestamptz default now()
);

alter table public.dioka_profiles enable row level security;
alter table public.dioka_carts enable row level security;
alter table public.dioka_orders enable row level security;

create policy "all_profiles" on public.dioka_profiles for all using (true) with check (true);
create policy "all_carts" on public.dioka_carts for all using (true) with check (true);
create policy "all_orders" on public.dioka_orders for all using (true) with check (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: "560px", background: "#fff", color: "#111", padding: "28px" }}>
        <DialogHeader>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
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
              <Database size={20} />
            </div>
            <div>
              <DialogTitle style={{ fontFamily: "var(--dioka-font)", fontSize: "22px", margin: 0 }}>
                Supabase Backend Setup
              </DialogTitle>
              <DialogDescription style={{ fontSize: "12px", color: "#666" }}>
                Connect your Supabase project to synchronize user accounts, shopping carts, and orders.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Status banner */}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background:
              status === "success"
                ? "rgba(18, 61, 50, 0.08)"
                : status === "error"
                ? "rgba(220, 38, 38, 0.08)"
                : "#f7f5f2",
            color:
              status === "success"
                ? "#123d32"
                : status === "error"
                ? "#b91c1c"
                : "#555",
            border:
              status === "success"
                ? "1px solid rgba(18, 61, 50, 0.25)"
                : status === "error"
                ? "1px solid rgba(220, 38, 38, 0.25)"
                : "1px solid #e5e0da",
          }}
        >
          {status === "success" && <CheckCircle2 size={16} color="#123d32" />}
          {status === "error" && <XCircle size={16} color="#b91c1c" />}
          {status === "testing" && <RefreshCw size={16} className="animate-spin" />}
          {status === "idle" && <KeyRound size={16} />}
          <span>
            {statusMessage ||
              (isSupabaseConfigured()
                ? "Supabase connected and active for all cart & shopping persistence."
                : "Provide your credentials below to connect your Supabase database.")}
          </span>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "4px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "#123d32",
                marginBottom: "5px",
              }}
            >
              Supabase Project URL
            </label>
            <input
              type="text"
              required
              placeholder="https://xyzabcdefg.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "13px",
                border: "1px solid #d4cdc5",
                borderRadius: "3px",
                fontFamily: "monospace",
                boxSizing: "border-box",
              }}
            />
            <span style={{ fontSize: "11px", color: "#777" }}>
              Find this in your Supabase project under <strong>Project Settings → API</strong>.
            </span>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "#123d32",
                marginBottom: "5px",
              }}
            >
              Supabase Anon Public Key
            </label>
            <input
              type="password"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "13px",
                border: "1px solid #d4cdc5",
                borderRadius: "3px",
                fontFamily: "monospace",
                boxSizing: "border-box",
              }}
            />
            <span style={{ fontSize: "11px", color: "#777" }}>
              The safe <code>anon</code> / <code>public</code> client API key.
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <button
              type="submit"
              disabled={status === "testing"}
              style={{
                flex: 1,
                background: "#123d32",
                color: "#fff",
                border: 0,
                padding: "11px 16px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                borderRadius: "3px",
                letterSpacing: ".04em",
              }}
            >
              {status === "testing" ? "Testing Connection..." : "Save & Connect Supabase"}
            </button>

            {isSupabaseConfigured() && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: "#fff",
                  color: "#666",
                  border: "1px solid #d4cdc5",
                  padding: "11px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  borderRadius: "3px",
                }}
              >
                Disconnect
              </button>
            )}
          </div>
        </form>

        {/* Database SQL Tables Helper */}
        <div style={{ marginTop: "16px", borderTop: "1px solid #eee", paddingTop: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setShowSql(!showSql)}
              style={{
                background: "none",
                border: 0,
                color: "#123d32",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              {showSql ? "Hide SQL Setup Script ▲" : "View Supabase SQL Table Script ▼"}
            </button>

            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: "#666",
                textDecoration: "none",
              }}
            >
              Supabase Dashboard <ExternalLink size={12} />
            </a>
          </div>

          {showSql && (
            <div style={{ marginTop: "10px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4px" }}>
                <button
                  type="button"
                  onClick={copySql}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "#f0ece7",
                    border: "1px solid #d9d3cb",
                    padding: "4px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  <Copy size={12} />
                  {copiedSql ? "Copied to clipboard!" : "Copy SQL Script"}
                </button>
              </div>
              <pre
                style={{
                  background: "#1c1917",
                  color: "#f5f5f4",
                  fontSize: "11px",
                  padding: "12px",
                  borderRadius: "4px",
                  maxHeight: "150px",
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                }}
              >
                {sqlSchema}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
