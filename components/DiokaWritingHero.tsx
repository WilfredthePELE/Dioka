"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, RotateCcw, ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store-context";

export function DiokaWritingHero() {
  const { setDesignerChatOpen } = useStore();
  const [animationKey, setAnimationKey] = useState(0);
  const [isWritingFinished, setIsWritingFinished] = useState(false);
  const [scriptMode, setScriptMode] = useState<"serif" | "cursive">("serif");

  // Restart writing animation
  const handleReplay = () => {
    setIsWritingFinished(false);
    setAnimationKey((prev) => prev + 1);
  };

  const scrollToCollection = () => {
    const el = document.getElementById("collection-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWritingFinished(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [animationKey, scriptMode]);

  return (
    <section
      id="hero-white"
      className="dioka-white-hero"
      aria-label="Dioka White Background Signature Hero"
    >
      <div className="dioka-white-container">
        {/* Eyebrow Atelier Tag */}
        <div className="dioka-eyebrow">
          <span className="dioka-dot">●</span>
          <span>FLORENCE · ARCHIVAL ATELIER</span>
          <span className="dioka-dot">●</span>
        </div>

        {/* Style mode pill selector */}
        <div className="dioka-script-switcher">
          <button
            type="button"
            className={`dioka-switch-btn ${scriptMode === "serif" ? "active" : ""}`}
            onClick={() => {
              setScriptMode("serif");
              handleReplay();
            }}
          >
            HAUTE ATELIER
          </button>
          <button
            type="button"
            className={`dioka-switch-btn ${scriptMode === "cursive" ? "active" : ""}`}
            onClick={() => {
              setScriptMode("cursive");
              handleReplay();
            }}
          >
            CALLIGRAPHY SIGNATURE
          </button>
        </div>

        {/* SVG WRITING CONTAINER (Click to replay) */}
        <div
          className="dioka-svg-wrap"
          onClick={handleReplay}
          title="Click to replay writing animation"
        >
          {scriptMode === "serif" ? (
            /* ============================================================
               HAUTE ATELIER SERIF WRITING STROKES: D - I - O - K - A
               Deep Tuscan Emerald & Obsidian Ink on Pure White
               ============================================================ */
            <svg
              key={`serif-${animationKey}`}
              viewBox="0 0 1000 320"
              className={`dioka-writing-svg ${isWritingFinished ? "finished" : ""}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Deep Obsidian-Emerald ink gradient on white */}
                <linearGradient id="inkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#123d32" />
                  <stop offset="30%" stopColor="#0b241e" />
                  <stop offset="65%" stopColor="#123d32" />
                  <stop offset="100%" stopColor="#255246" />
                </linearGradient>

                {/* Subtle soft shadow on white paper */}
                <filter id="paperShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#123d32" floodOpacity="0.12" />
                </filter>
              </defs>

              {/* LETTER D */}
              {/* D - Vertical Pillar Stem */}
              <path
                d="M 130,65 L 130,235"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="11"
                strokeLinecap="round"
                className="stroke-d1"
                filter="url(#paperShadow)"
              />
              {/* D - Top Serif */}
              <path
                d="M 105,65 L 155,65"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                className="stroke-d-serif1"
              />
              {/* D - Bottom Serif */}
              <path
                d="M 105,235 L 155,235"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                className="stroke-d-serif2"
              />
              {/* D - Grand Curving Bowl */}
              <path
                d="M 130,65 C 220,65 242,105 242,150 C 242,195 220,235 130,235"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                className="stroke-d2"
                filter="url(#paperShadow)"
              />

              {/* LETTER I */}
              {/* I - Top Serif Bar */}
              <path
                d="M 285,65 L 335,65"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                className="stroke-i-serif1"
              />
              {/* I - Main Column */}
              <path
                d="M 310,65 L 310,235"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="11"
                strokeLinecap="round"
                className="stroke-i"
                filter="url(#paperShadow)"
              />
              {/* I - Bottom Serif Bar */}
              <path
                d="M 285,235 L 335,235"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                className="stroke-i-serif2"
              />

              {/* LETTER O */}
              {/* O - Complete Harmonious Oval */}
              <path
                d="M 440,65 C 368,65 368,235 440,235 C 512,235 512,65 440,65 Z"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-o"
                filter="url(#paperShadow)"
              />

              {/* LETTER K */}
              {/* K - Vertical Column */}
              <path
                d="M 560,65 L 560,235"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="11"
                strokeLinecap="round"
                className="stroke-k1"
                filter="url(#paperShadow)"
              />
              {/* K - Top & Bottom Serifs */}
              <path
                d="M 538,65 L 582,65"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                className="stroke-k-serif1"
              />
              <path
                d="M 538,235 L 582,235"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                className="stroke-k-serif2"
              />
              {/* K - Upper Arm */}
              <path
                d="M 562,150 L 648,68"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="9"
                strokeLinecap="round"
                className="stroke-k2"
                filter="url(#paperShadow)"
              />
              {/* K - Upper Arm Serif */}
              <path
                d="M 632,64 L 664,72"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                className="stroke-k-serif3"
              />
              {/* K - Lower Leg */}
              <path
                d="M 588,126 L 665,235"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="10.5"
                strokeLinecap="round"
                className="stroke-k3"
                filter="url(#paperShadow)"
              />
              {/* K - Lower Leg Serif */}
              <path
                d="M 648,235 L 682,235"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                className="stroke-k-serif4"
              />

              {/* LETTER A */}
              {/* A - Left Ascending Diagonal */}
              <path
                d="M 785,65 L 715,235"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                className="stroke-a1"
                filter="url(#paperShadow)"
              />
              {/* A - Right Heavy Descending Diagonal */}
              <path
                d="M 785,65 L 855,235"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="11.5"
                strokeLinecap="round"
                className="stroke-a2"
                filter="url(#paperShadow)"
              />
              {/* A - Center Crossbar */}
              <path
                d="M 738,175 L 832,175"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="6.5"
                strokeLinecap="round"
                className="stroke-a3"
              />
              {/* A - Left & Right Feet Serifs */}
              <path
                d="M 698,235 L 732,235"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                className="stroke-a-serif1"
              />
              <path
                d="M 838,235 L 872,235"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                className="stroke-a-serif2"
              />

              {/* REGISTERED TRADEMARK ® */}
              <circle
                cx="895"
                cy="75"
                r="11"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="2.5"
                className="stroke-reg"
              />
              <text
                x="895"
                y="79"
                fontSize="10"
                fontFamily="sans-serif"
                fontWeight="700"
                fill="#123d32"
                textAnchor="middle"
                className="stroke-reg-text"
              >
                R
              </text>

              {/* FLORENTINE GOLD/EMERALD UNDERLINE STROKE */}
              <path
                d="M 90,268 C 240,266 500,272 780,266 C 840,264 900,258 925,250"
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="stroke-flourish"
                filter="url(#paperShadow)"
              />
            </svg>
          ) : (
            /* ============================================================
               HAUTE CALLIGRAPHY CURSIVE WRITING
               ============================================================ */
            <svg
              key={`cursive-${animationKey}`}
              viewBox="0 0 1000 360"
              className={`dioka-writing-svg ${isWritingFinished ? "finished" : ""}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="cursiveInkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#123d32" />
                  <stop offset="40%" stopColor="#0b241e" />
                  <stop offset="70%" stopColor="#123d32" />
                  <stop offset="100%" stopColor="#255246" />
                </linearGradient>

                <filter id="cursiveShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#123d32" floodOpacity="0.12" />
                </filter>
              </defs>

              {/* CURSIVE D */}
              <path
                d="M 120,60 C 112,120 108,190 122,250 C 108,258 92,252 95,236 C 98,214 140,248 185,248 C 248,248 296,202 296,145 C 296,82 238,50 178,50 C 152,50 134,56 120,68"
                fill="none"
                stroke="url(#cursiveInkGrad)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cursive-d"
                filter="url(#cursiveShadow)"
              />

              {/* CURSIVE I */}
              <path
                d="M 285,190 C 310,185 342,162 364,142 C 372,135 378,152 374,180 C 368,214 368,245 385,245 C 398,245 412,228 425,206"
                fill="none"
                stroke="url(#cursiveInkGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cursive-i"
                filter="url(#cursiveShadow)"
              />
              <circle
                cx="376"
                cy="108"
                r="6.5"
                fill="url(#cursiveInkGrad)"
                className="cursive-dot"
                filter="url(#cursiveShadow)"
              />

              {/* CURSIVE O */}
              <path
                d="M 432,192 C 430,165 444,142 468,142 C 496,142 514,168 510,202 C 506,236 480,248 458,248 C 434,248 422,228 424,200 C 426,168 455,148 478,148 C 496,148 506,160 512,176"
                fill="none"
                stroke="url(#cursiveInkGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cursive-o"
                filter="url(#cursiveShadow)"
              />

              {/* CURSIVE K */}
              <path
                d="M 512,176 C 528,158 554,105 578,55 C 588,34 598,38 590,66 C 578,110 554,198 546,246 C 544,256 555,244 564,226 C 580,192 605,162 624,176 C 635,185 624,204 606,218 C 618,226 642,244 665,246"
                fill="none"
                stroke="url(#cursiveInkGrad)"
                strokeWidth="8.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cursive-k"
                filter="url(#cursiveShadow)"
              />

              {/* CURSIVE A */}
              <path
                d="M 665,246 C 680,222 700,168 715,152 C 728,140 748,146 756,150 C 778,155 792,180 788,212 C 782,242 758,248 740,248 C 718,248 708,230 710,205 C 714,168 748,148 772,148 C 785,148 792,160 794,182 C 795,212 794,242 812,242 C 825,242 842,225 860,202"
                fill="none"
                stroke="url(#cursiveInkGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cursive-a"
                filter="url(#cursiveShadow)"
              />

              {/* FLOURISH */}
              <path
                d="M 80,285 C 240,282 480,290 760,280 C 830,278 900,270 930,258"
                fill="none"
                stroke="url(#cursiveInkGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                className="cursive-flourish"
                filter="url(#cursiveShadow)"
              />
            </svg>
          )}
        </div>

        {/* SUBTITLE & ATELIER WRITEUP (Fades in smoothly) */}
        <div className={`dioka-writing-sub ${isWritingFinished ? "active" : ""}`}>
          <h2 className="dioka-heritage-title">Haute Maroquinerie & Calzoleria</h2>
          <p className="dioka-heritage-desc">
            Handcrafted in Florence, Italy · Vegetable-tanned Tuscan hides, resolable Goodyear welts, and second-skin lambskin.
          </p>

          {/* Luxury Call-To-Action Buttons on White */}
          <div className="dioka-cta-row">
            <button
              type="button"
              onClick={scrollToCollection}
              className="dioka-btn-primary"
            >
              Shop Collection <ArrowRight size={14} />
            </button>

            <Link href="/customize" className="dioka-btn-secondary">
              <Sparkles size={14} />
              Bespoke Customizer
            </Link>

            <button
              type="button"
              onClick={() => setDesignerChatOpen(true)}
              className="dioka-btn-chat"
              title="Chat with Dioka Concierge"
            >
              <MessageCircle size={15} />
              Chat with Concierge
            </button>
          </div>
        </div>
      </div>

      {/* MINIMAL BOTTOM BAR */}
      <div className="dioka-hero-bottom-bar">
        {/* Replay signature */}
        <button
          type="button"
          onClick={handleReplay}
          className="dioka-hero-btn"
          aria-label="Replay Dioka signature handwriting"
          title="Replay Writing Animation"
        >
          <RotateCcw size={13} />
          <span>Replay Signature</span>
        </button>

        {/* Scroll cue */}
        <button
          type="button"
          onClick={scrollToCollection}
          className="dioka-scroll-cue"
          aria-label="Scroll to explore collection"
        >
          <span>EXPLORE COLLECTION</span>
          <ChevronDown size={15} className="dioka-bounce-arrow" />
        </button>

        {/* Origin Badge */}
        <div className="dioka-origin-badge">
          <span>FIRENZE · ITALIA</span>
        </div>
      </div>

      {/* CLEAN WHITE HERO STYLING */}
      <style jsx>{`
        .dioka-white-hero {
          position: relative;
          width: 100%;
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          padding: 60px 4% 90px;
          border-bottom: 1px solid var(--dioka-line);
          overflow: hidden;
        }

        .dioka-white-container {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 980px;
          text-align: center;
          user-select: none;
        }

        .dioka-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--dioka-sans), -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.28em;
          color: var(--dioka-oxblood);
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .dioka-dot {
          font-size: 8px;
          color: var(--dioka-oxblood);
        }

        .dioka-script-switcher {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 24px;
          background: #f7f5f0;
          padding: 4px;
          border-radius: 999px;
          border: 1px solid #e8e3d9;
        }

        .dioka-switch-btn {
          background: none;
          border: 0;
          color: #717171;
          font-family: var(--dioka-sans), sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          padding: 6px 14px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .dioka-switch-btn:hover {
          color: var(--dioka-emerald);
        }
        .dioka-switch-btn.active {
          background: #ffffff;
          color: var(--dioka-emerald);
          box-shadow: 0 2px 6px rgba(18, 61, 50, 0.12);
        }

        .dioka-svg-wrap {
          width: 100%;
          cursor: pointer;
          transition: transform 0.3s ease;
          padding: 10px 0;
        }
        .dioka-svg-wrap:hover {
          transform: scale(1.015);
        }

        .dioka-writing-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        /* SERIF STROKES TIMINGS */
        .stroke-d1 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: writeStroke 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.15s forwards;
        }
        .stroke-d-serif1 {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: writeStroke 0.2s ease 0.65s forwards;
        }
        .stroke-d-serif2 {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: writeStroke 0.2s ease 0.75s forwards;
        }
        .stroke-d2 {
          stroke-dasharray: 450;
          stroke-dashoffset: 450;
          animation: writeStroke 0.85s cubic-bezier(0.4, 0, 0.2, 1) 0.85s forwards;
        }

        .stroke-i-serif1 {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: writeStroke 0.2s ease 1.55s forwards;
        }
        .stroke-i {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: writeStroke 0.55s cubic-bezier(0.4, 0, 0.2, 1) 1.65s forwards;
        }
        .stroke-i-serif2 {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: writeStroke 0.2s ease 2.05s forwards;
        }

        .stroke-o {
          stroke-dasharray: 550;
          stroke-dashoffset: 550;
          animation: writeStroke 0.9s cubic-bezier(0.4, 0, 0.2, 1) 2.1s forwards;
        }

        .stroke-k1 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: writeStroke 0.55s cubic-bezier(0.4, 0, 0.2, 1) 2.75s forwards;
        }
        .stroke-k-serif1 {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: writeStroke 0.18s ease 3.15s forwards;
        }
        .stroke-k-serif2 {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: writeStroke 0.18s ease 3.25s forwards;
        }
        .stroke-k2 {
          stroke-dasharray: 140;
          stroke-dashoffset: 140;
          animation: writeStroke 0.4s cubic-bezier(0.4, 0, 0.2, 1) 3.1s forwards;
        }
        .stroke-k-serif3 {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: writeStroke 0.18s ease 3.45s forwards;
        }
        .stroke-k3 {
          stroke-dasharray: 160;
          stroke-dashoffset: 160;
          animation: writeStroke 0.45s cubic-bezier(0.4, 0, 0.2, 1) 3.35s forwards;
        }
        .stroke-k-serif4 {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: writeStroke 0.18s ease 3.65s forwards;
        }

        .stroke-a1 {
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
          animation: writeStroke 0.5s cubic-bezier(0.4, 0, 0.2, 1) 3.55s forwards;
        }
        .stroke-a2 {
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
          animation: writeStroke 0.55s cubic-bezier(0.4, 0, 0.2, 1) 3.85s forwards;
        }
        .stroke-a3 {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: writeStroke 0.3s ease 4.25s forwards;
        }
        .stroke-a-serif1 {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: writeStroke 0.18s ease 4.45s forwards;
        }
        .stroke-a-serif2 {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: writeStroke 0.18s ease 4.55s forwards;
        }

        .stroke-reg {
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
          animation: writeStroke 0.3s ease 4.65s forwards;
        }
        .stroke-reg-text {
          opacity: 0;
          animation: fadeInText 0.3s ease 4.85s forwards;
        }

        .stroke-flourish {
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          animation: writeStroke 0.75s cubic-bezier(0.4, 0, 0.2, 1) 4.75s forwards;
        }

        /* CURSIVE TIMINGS */
        .cursive-d {
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          animation: writeStroke 1.1s cubic-bezier(0.42, 0, 0.58, 1) 0.2s forwards;
        }
        .cursive-i {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: writeStroke 0.55s cubic-bezier(0.42, 0, 0.58, 1) 1.25s forwards;
        }
        .cursive-dot {
          opacity: 0;
          transform-origin: 376px 108px;
          animation: popDot 0.25s ease-out 1.78s forwards;
        }
        .cursive-o {
          stroke-dasharray: 550;
          stroke-dashoffset: 550;
          animation: writeStroke 0.75s cubic-bezier(0.42, 0, 0.58, 1) 1.85s forwards;
        }
        .cursive-k {
          stroke-dasharray: 950;
          stroke-dashoffset: 950;
          animation: writeStroke 0.9s cubic-bezier(0.42, 0, 0.58, 1) 2.55s forwards;
        }
        .cursive-a {
          stroke-dasharray: 650;
          stroke-dashoffset: 650;
          animation: writeStroke 0.75s cubic-bezier(0.42, 0, 0.58, 1) 3.4s forwards;
        }
        .cursive-flourish {
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          animation: writeStroke 0.8s cubic-bezier(0.42, 0, 0.58, 1) 3.95s forwards;
        }

        @keyframes writeStroke {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes popDot {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          70% {
            opacity: 1;
            transform: scale(1.4);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInText {
          to {
            opacity: 1;
          }
        }

        /* Subtitle Fade In */
        .dioka-writing-sub {
          margin-top: 24px;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 1.2s ease, transform 1.2s ease;
          pointer-events: none;
        }
        .dioka-writing-sub.active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .dioka-heritage-title {
          font-family: var(--dioka-font), serif;
          font-size: clamp(24px, 2.8vw, 36px);
          font-weight: 500;
          color: var(--dioka-emerald);
          letter-spacing: 0.04em;
          margin: 0 0 8px;
          text-transform: capitalize;
        }

        .dioka-heritage-desc {
          margin: 0 0 28px;
          font-family: var(--dioka-sans), sans-serif;
          font-size: clamp(13px, 1.2vw, 15px);
          color: var(--dioka-muted);
          max-width: 580px;
          line-height: 1.6;
        }

        /* Action Buttons */
        .dioka-cta-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .dioka-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 26px;
          background: var(--dioka-emerald);
          color: #ffffff;
          border: 1px solid var(--dioka-emerald);
          font-family: var(--dioka-sans), sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 2px;
        }
        .dioka-btn-primary:hover {
          background: var(--dioka-emerald-light);
          border-color: var(--dioka-emerald-light);
          transform: translateY(-1px);
        }

        .dioka-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 24px;
          background: #ffffff;
          color: var(--dioka-emerald);
          border: 1px solid var(--dioka-line);
          font-family: var(--dioka-sans), sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 2px;
        }
        .dioka-btn-secondary:hover {
          background: var(--dioka-paper);
          border-color: var(--dioka-emerald);
        }

        .dioka-btn-chat {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 22px;
          background: #f0f2f5;
          color: var(--dioka-emerald);
          border: 1px solid transparent;
          font-family: var(--dioka-sans), sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 2px;
        }
        .dioka-btn-chat:hover {
          background: #e4e6eb;
          color: #0084ff;
        }

        /* Bottom bar */
        .dioka-hero-bottom-bar {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4.5%;
          z-index: 10;
        }

        .dioka-hero-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: 1px solid var(--dioka-line);
          color: var(--dioka-muted);
          padding: 6px 14px;
          border-radius: 999px;
          font-family: var(--dioka-sans), sans-serif;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .dioka-hero-btn:hover {
          color: var(--dioka-emerald);
          border-color: var(--dioka-emerald);
        }

        .dioka-scroll-cue {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: none;
          border: 0;
          color: var(--dioka-muted);
          font-family: var(--dioka-sans), sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .dioka-scroll-cue:hover {
          color: var(--dioka-emerald);
        }

        .dioka-origin-badge {
          font-family: var(--dioka-sans), sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--dioka-muted);
        }

        .dioka-bounce-arrow {
          animation: bounceCue 2s infinite ease-in-out;
        }

        @keyframes bounceCue {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(5px);
          }
        }

        @media (max-width: 768px) {
          .dioka-white-hero {
            padding: 40px 4% 80px;
            min-height: calc(100vh - 70px);
          }
          .dioka-heritage-desc {
            font-size: 13px;
          }
          .dioka-hero-btn span {
            display: none;
          }
          .dioka-hero-btn {
            padding: 6px;
          }
        }
      `}</style>
    </section>
  );
}
