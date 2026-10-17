"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Play, Pause, Sparkles, Volume2, VolumeX } from "lucide-react";

export function AtelierSplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnter = () => {
    setIsFadingOut(true);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("dioka_splash_viewed", "true");
      } catch {
        // ignore
      }
    }
    setTimeout(() => {
      setIsVisible(false);
      setIsFadingOut(false);
    }, 600);
  };

  const toggleVideoPlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Show splash screen on first visit or when triggered
    const timer = setTimeout(() => {
      try {
        const hasSeen = sessionStorage.getItem("dioka_splash_viewed");
        if (!hasSeen) {
          setIsVisible(true);
        }
      } catch {
        // ignore
      }
    }, 10);

    const handleReplay = () => {
      setIsFadingOut(false);
      setIsVisible(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    };

    window.addEventListener("show-atelier-splash", handleReplay);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("show-atelier-splash", handleReplay);
    };
  }, []);

  // Try playing video when visible
  useEffect(() => {
    if (isVisible && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Dioka Atelier Crafting Film Splash Screen"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        background: "#0d0b09",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? "scale(1.03)" : "scale(1)",
        pointerEvents: isFadingOut ? "none" : "auto",
      }}
    >
      {/* Fullscreen Artisan Crafting Video Background */}
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
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
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
            filter: "brightness(70%) contrast(110%) saturate(108%)",
          }}
        >
          <source src="/shoemaker-craft-optimized.mp4" type="video/mp4" />
          <source src="/shoemaker-craft.mp4" type="video/mp4" />
          <source src="/italian-shoemaker-atelier.mp4" type="video/mp4" />
          <source src="/shoemaker-daylight-brown.mp4" type="video/mp4" />
        </video>

        {/* Ambient Film Vignette & Subtle Warm Tonal Gradients */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at center, rgba(18, 61, 50, 0.25) 0%, rgba(10, 8, 6, 0.72) 65%, rgba(10, 8, 6, 0.94) 100%)",
          }}
        />
      </div>

      {/* Top Controls Bar: Sound Toggle, Film Pause, Quick Enter */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          right: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {/* Live Workshop Indicator */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(10px)",
            padding: "8px 14px",
            borderRadius: "999px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            fontFamily: "var(--dioka-sans)",
          }}
        >
          <span style={{ color: "#22c55e", fontSize: "14px" }}>●</span>
          <span>Florence Atelier Crafting Film</span>
        </div>

        {/* Video & Audio Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={toggleVideoPlayback}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(10px)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              padding: "7px 12px",
              borderRadius: "999px",
              fontFamily: "var(--dioka-sans)",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            title={isPlaying ? "Pause crafting film" : "Play crafting film"}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span className="hidden sm:inline">{isPlaying ? "Pause Film" : "Play Film"}</span>
          </button>

          <button
            type="button"
            onClick={toggleAudio}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: isMuted ? "rgba(0, 0, 0, 0.55)" : "rgba(18, 61, 50, 0.85)",
              backdropFilter: "blur(10px)",
              color: "#ffffff",
              border: isMuted ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid rgba(34, 197, 94, 0.6)",
              padding: "7px 12px",
              borderRadius: "999px",
              fontFamily: "var(--dioka-sans)",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            title={isMuted ? "Unmute atelier sound" : "Mute atelier sound"}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span className="hidden sm:inline">{isMuted ? "Sound Off" : "Sound On"}</span>
          </button>

          <button
            type="button"
            onClick={handleEnter}
            style={{
              background: "rgba(255, 255, 255, 0.18)",
              backdropFilter: "blur(10px)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.35)",
              padding: "7px 16px",
              borderRadius: "999px",
              fontFamily: "var(--dioka-sans)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Skip to Store →
          </button>
        </div>
      </div>

      {/* Central Haute-Horlogerie / Atelier Typography & Action Card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          color: "#fff",
          maxWidth: "680px",
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
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            padding: "6px 16px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "#e8ded1",
            fontFamily: "var(--dioka-sans)",
          }}
        >
          <Sparkles size={12} color="#e09f3e" />
          <span>FLORENTINE ARTISAN LEATHER ATELIER</span>
        </div>

        {/* Brand Wordmark */}
        <h1
          style={{
            fontFamily: "var(--dioka-font)",
            fontSize: "clamp(64px, 11vw, 112px)",
            fontWeight: 500,
            letterSpacing: ".08em",
            margin: "0",
            lineHeight: "0.9",
            color: "#ffffff",
            textShadow: "0 4px 30px rgba(0,0,0,0.7)",
          }}
        >
          DIOKA<span>®</span>
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#f0eae1",
            maxWidth: "520px",
            margin: "6px 0 16px",
            lineHeight: "1.6",
            fontFamily: "var(--dioka-sans)",
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
          }}
        >
          Watch our Florentine master craftsmen cut, skive, and saddle-stitch Tuscan vegetable-tanned hides. Genuine Goodyear boots, sculpted bags, and drum-dyed lambskin jackets.
        </p>

        {/* Enter Atelier Primary CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "4px" }}>
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
              padding: "16px 40px",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              borderRadius: "2px",
              cursor: "pointer",
              boxShadow: "0 10px 35px rgba(0, 0, 0, 0.6)",
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
            color: "rgba(255, 255, 255, 0.65)",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            marginTop: "10px",
            fontFamily: "var(--dioka-sans)",
          }}
        >
          Crafted in Florence & London · 100% Full-Grain Vegetable-Tanned Leather
        </span>
      </div>
    </div>
  );
}
