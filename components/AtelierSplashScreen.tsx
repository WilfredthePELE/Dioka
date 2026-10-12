"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export function AtelierSplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleEnter = () => {
    setIsFadingOut(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dioka_splash_viewed", "true");
    }
    setTimeout(() => {
      setIsVisible(false);
    }, 700);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeen = sessionStorage.getItem("dioka_splash_viewed");
    if (hasSeen) return;

    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    const autoTimer = setTimeout(() => {
      handleEnter();
    }, 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(autoTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Welcome to Dioka Atelier"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#120e0c",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transition: "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? "scale(1.02)" : "scale(1)",
        pointerEvents: isFadingOut ? "none" : "auto",
      }}
    >
      {/* Fullscreen Video Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/preview-frame.jpg"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            minWidth: "100%",
            minHeight: "100%",
            width: "auto",
            height: "auto",
            transform: "translate(-50%, -50%)",
            objectFit: "cover",
            filter: "brightness(65%) contrast(115%) saturate(110%)",
          }}
        >
          <source src="/shoemaker-craft-optimized.mp4" type="video/mp4" />
          <source src="/shoemaker-craft.mp4" type="video/mp4" />
          <source src="/italian-shoemaker-atelier.mp4" type="video/mp4" />
        </video>

        {/* Ambient Vignette & Gradient Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at center, rgba(18, 61, 50, 0.3) 0%, rgba(10, 8, 6, 0.78) 70%, rgba(10, 8, 6, 0.95) 100%)",
          }}
        />
      </div>

      {/* Splash Screen Content Card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          color: "#fff",
          maxWidth: "620px",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "#e8ded1",
          }}
        >
          <Sparkles size={12} color="#e09f3e" />
          EUROPEAN ARTISAN LEATHER ATELIER
        </div>

        {/* Grand Wordmark Logo */}
        <h1
          style={{
            fontFamily: "var(--dioka-font)",
            fontSize: "clamp(56px, 10vw, 104px)",
            fontWeight: 500,
            letterSpacing: ".08em",
            margin: "0",
            lineHeight: "0.9",
            color: "#ffffff",
            textShadow: "0 4px 24px rgba(0,0,0,0.6)",
          }}
        >
          DIOKA<span>®</span>
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#f0eae1",
            maxWidth: "480px",
            margin: "8px 0 16px",
            lineHeight: "1.6",
            fontFamily: "var(--dioka-sans)",
            textShadow: "0 2px 10px rgba(0,0,0,0.7)",
          }}
        >
          Handcrafted full-grain leather bags, Goodyear-welted boots, and tailored lambskin jackets made to endure for decades.
        </p>

        {/* Enter Atelier CTA Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "8px" }}>
          <button
            type="button"
            onClick={handleEnter}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "#ffffff",
              color: "#123d32",
              border: 0,
              padding: "16px 36px",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              borderRadius: "2px",
              cursor: "pointer",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background = "#f7f4ed";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "#ffffff";
            }}
          >
            <span>Enter Atelier</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <span
          style={{
            fontSize: "11px",
            color: "rgba(255, 255, 255, 0.6)",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            marginTop: "12px",
          }}
        >
          Crafted in Florence & London · 100% Genuine Leather
        </span>
      </div>
    </div>
  );
}
