"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingBag,
  Package,
  LogOut,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export function AccountModal() {
  const {
    user,
    isAuthenticated,
    accountModalOpen,
    setAccountModalOpen,
    accountModalTab,
    setAccountModalTab,
    login,
    register,
    logout,
    cartCount,
    setCartOpen,
    formatPrice,
    subtotal,
  } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to sign in. Please verify credentials.");
    } else {
      setSuccessMsg("Signed in! Your specialized bag is ready.");
      setTimeout(() => {
        setAccountModalOpen(false);
        setSuccessMsg(null);
      }, 1000);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Registration failed.");
    } else {
      setSuccessMsg("Account created! Your personalized cart has been synced.");
      setTimeout(() => {
        setAccountModalOpen(false);
        setSuccessMsg(null);
      }, 1000);
    }
  };

  const fillDemoAccount = () => {
    setEmail("client@dioka.com");
    setPassword("atelier2026");
    setError(null);
  };

  return (
    <Dialog open={accountModalOpen} onOpenChange={setAccountModalOpen}>
      <DialogContent
        className="account-modal-content"
        style={{
          maxWidth: "480px",
          width: "95vw",
          padding: "28px",
          borderRadius: "4px",
          backgroundColor: "#fff",
        }}
      >
        <DialogHeader style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span
              style={{
                fontFamily: "var(--dioka-sans, sans-serif)",
                fontSize: "11px",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "#123d32",
                fontWeight: 700,
              }}
            >
              DIOKA ATELIER · CLIENT ACCOUNT
            </span>
          </div>
          <DialogTitle
            style={{
              fontFamily: "var(--dioka-serif, serif)",
              fontSize: "26px",
              color: "#123d32",
              lineHeight: 1.2,
            }}
          >
            {isAuthenticated
              ? `Welcome, ${user?.name}`
              : accountModalTab === "login"
              ? "Sign In to Your Account"
              : "Create Your Dioka Account"}
          </DialogTitle>
          <DialogDescription style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
            {isAuthenticated
              ? "Access your specialized bag, saved favorites, and private order history."
              : accountModalTab === "login"
              ? "Sign in to synchronize your specialized bag across all your devices."
              : "Join our client list to receive a specialized cart, order tracking, and limited restock notices."}
          </DialogDescription>
        </DialogHeader>

        {/* Tab switchers if not logged in */}
        {!isAuthenticated && (
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #e5e5e5",
              marginBottom: "20px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAccountModalTab("login");
                setError(null);
              }}
              style={{
                flex: 1,
                padding: "10px 0",
                fontSize: "13px",
                fontWeight: accountModalTab === "login" ? 700 : 500,
                color: accountModalTab === "login" ? "#123d32" : "#888",
                borderBottom: accountModalTab === "login" ? "2px solid #123d32" : "2px solid transparent",
                background: "none",
                borderTop: 0,
                borderLeft: 0,
                borderRight: 0,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountModalTab("register");
                setError(null);
              }}
              style={{
                flex: 1,
                padding: "10px 0",
                fontSize: "13px",
                fontWeight: accountModalTab === "register" ? 700 : 500,
                color: accountModalTab === "register" ? "#123d32" : "#888",
                borderBottom: accountModalTab === "register" ? "2px solid #123d32" : "2px solid transparent",
                background: "none",
                borderTop: 0,
                borderLeft: 0,
                borderRight: 0,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              New Account
            </button>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              borderRadius: "3px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: "10px 14px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              borderRadius: "3px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB: SIGN IN */}
        {!isAuthenticated && accountModalTab === "login" && (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  color: "#123d32",
                  marginBottom: "5px",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "2px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    color: "#123d32",
                  }}
                >
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "2px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="dark-button"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "13px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                marginTop: "6px",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing In...
                </>
              ) : (
                "Sign In & Sync My Bag"
              )}
            </button>

            {/* Quick Demo Credentials */}
            <div
              style={{
                marginTop: "8px",
                padding: "10px 12px",
                background: "#f9f9f9",
                border: "1px dashed #d1d5db",
                borderRadius: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#555",
              }}
            >
              <span>Test with demo account?</span>
              <button
                type="button"
                onClick={fillDemoAccount}
                style={{
                  background: "none",
                  border: "1px solid #123d32",
                  color: "#123d32",
                  padding: "4px 8px",
                  borderRadius: "2px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Use Demo Login
              </button>
            </div>
          </form>
        )}

        {/* TAB: REGISTER */}
        {!isAuthenticated && accountModalTab === "register" && (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  color: "#123d32",
                  marginBottom: "5px",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wilfred Owubokiri"
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "2px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  color: "#123d32",
                  marginBottom: "5px",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "2px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  color: "#123d32",
                  marginBottom: "5px",
                }}
              >
                Create Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "2px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Specialized Cart Benefit Checklist */}
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f4f7f5",
                borderRadius: "3px",
                fontSize: "12px",
                color: "#123d32",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={14} color="#123d32" />
                <strong>Your Own Specialized Bag:</strong> Synced & saved automatically
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={14} color="#123d32" />
                <span>Pre-filled shipping details & faster checkout</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={14} color="#123d32" />
                <span>Private access to limited edition leather drops</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="dark-button"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "13px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating Account...
                </>
              ) : (
                "Create Account & Specialized Bag"
              )}
            </button>
          </form>
        )}

        {/* TAB: LOGGED IN USER PROFILE */}
        {isAuthenticated && user && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div
              style={{
                padding: "14px",
                backgroundColor: "#f4f7f5",
                border: "1px solid #d1ded7",
                borderRadius: "3px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <strong style={{ fontSize: "16px", color: "#123d32" }}>{user.name}</strong>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    padding: "3px 8px",
                    background: "#123d32",
                    color: "#fff",
                    borderRadius: "2px",
                  }}
                >
                  Member
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "#666" }}>{user.email}</div>
              <div style={{ fontSize: "12px", color: "#123d32", marginTop: "6px", fontWeight: 500 }}>
                {user.tier}
              </div>
            </div>

            {/* Specialized Bag Status Box */}
            <div
              style={{
                padding: "14px",
                border: "1px solid #e5e5e5",
                borderRadius: "3px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShoppingBag size={18} color="#123d32" />
                  <strong style={{ fontSize: "14px", color: "#123d32" }}>
                    Your Specialized Bag ({cartCount} {cartCount === 1 ? "item" : "items"})
                  </strong>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#123d32" }}>
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>
                All selections are synchronized with your account and saved across your devices.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setAccountModalOpen(false);
                    setCartOpen(true);
                  }}
                  className="dark-button"
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    fontSize: "12px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  Open Your Bag <ArrowRight size={14} />
                </button>
                <Link
                  href="/cart"
                  onClick={() => setAccountModalOpen(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 14px",
                    border: "1px solid #123d32",
                    color: "#123d32",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                    borderRadius: "2px",
                  }}
                >
                  Full Bag Page
                </Link>
              </div>
            </div>

            {/* Orders Summary */}
            {user.orders && user.orders.length > 0 && (
              <div style={{ border: "1px solid #e5e5e5", padding: "14px", borderRadius: "3px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <Package size={17} color="#123d32" />
                  <strong style={{ fontSize: "14px", color: "#123d32" }}>Recent Orders</strong>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {user.orders.map((ord) => (
                    <div
                      key={ord.orderId}
                      style={{
                        padding: "8px 10px",
                        backgroundColor: "#f9f9f9",
                        borderRadius: "2px",
                        fontSize: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong>Order #{ord.orderId}</strong>
                        <div style={{ color: "#666" }}>Tracking: {ord.trackingCode}</div>
                      </div>
                      <span
                        style={{
                          color: "#166534",
                          backgroundColor: "#dcfce7",
                          padding: "2px 6px",
                          borderRadius: "2px",
                          fontWeight: 600,
                        }}
                      >
                        {ord.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={logout}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px",
                background: "none",
                border: "1px solid #d1d5db",
                color: "#666",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                borderRadius: "2px",
              }}
            >
              <LogOut size={16} /> Sign Out of Account
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
