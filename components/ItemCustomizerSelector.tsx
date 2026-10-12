"use client";

import React from "react";
import { Check, Sparkles } from "lucide-react";
import {
  ATELIER_COLORS,
  ATELIER_LEATHERS,
  ATELIER_SHAPES,
  type AtelierColor,
} from "@/lib/products";

interface ItemCustomizerSelectorProps {
  selectedColor: AtelierColor;
  onSelectColor: (c: AtelierColor) => void;
  selectedLeather: string;
  onSelectLeather: (l: string) => void;
  selectedShape: string;
  onSelectShape: (s: string) => void;
  monogram?: string;
  onMonogramChange?: (m: string) => void;
  compact?: boolean;
}

export function ItemCustomizerSelector({
  selectedColor,
  onSelectColor,
  selectedLeather,
  onSelectLeather,
  selectedShape,
  onSelectShape,
  monogram = "",
  onMonogramChange,
  compact = false,
}: ItemCustomizerSelectorProps) {
  const isMonogramSelected = selectedShape === "Personal Monogram";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? "14px" : "20px",
        background: compact ? "#faf8f4" : "#fbf9f6",
        padding: compact ? "12px 14px" : "18px 20px",
        borderRadius: "4px",
        border: "1px solid #e7e0d5",
        marginTop: compact ? "10px" : "18px",
      }}
    >
      {/* 1. COLOUR SELECTION */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: compact ? "10px" : "11px",
              fontWeight: 700,
              letterSpacing: ".09em",
              textTransform: "uppercase",
              color: "#123d32",
            }}
          >
            Colour: <strong style={{ color: "#5b1f2b" }}>{selectedColor}</strong>
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "#75847b",
              fontWeight: 500,
            }}
          >
            6 Atelier Shades
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "8px",
          }}
        >
          {ATELIER_COLORS.map((c) => {
            const isSelected = selectedColor === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => onSelectColor(c.name)}
                title={`${c.name} Leather`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  background: isSelected ? "#fff" : "transparent",
                  border: isSelected
                    ? "2px solid #123d32"
                    : "1px solid #ded6ca",
                  borderRadius: "3px",
                  padding: compact ? "6px 2px" : "8px 4px",
                  cursor: "pointer",
                  transition: "all .15s ease",
                  boxShadow: isSelected
                    ? "0 2px 6px rgba(18, 61, 50, 0.15)"
                    : "none",
                }}
              >
                <span
                  style={{
                    width: compact ? "18px" : "22px",
                    height: compact ? "18px" : "22px",
                    borderRadius: "50%",
                    background: c.hex,
                    border: `1px solid ${c.border}`,
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSelected && (
                    <Check
                      size={12}
                      color={
                        c.name === "Sand" || c.name === "Sahara Tan"
                          ? "#123d32"
                          : "#fff"
                      }
                      strokeWidth={3}
                    />
                  )}
                </span>
                <span
                  style={{
                    fontSize: compact ? "9px" : "10px",
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? "#123d32" : "#555",
                    textAlign: "center",
                    lineHeight: 1.1,
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CHOICE OF LEATHER */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: compact ? "10px" : "11px",
              fontWeight: 700,
              letterSpacing: ".09em",
              textTransform: "uppercase",
              color: "#123d32",
            }}
          >
            Choice of Leather:{" "}
            <strong style={{ color: "#5b1f2b" }}>{selectedLeather}</strong>
          </span>
          <span style={{ fontSize: "11px", color: "#75847b" }}>
            Hand-curated hides
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: compact ? "1fr 1fr" : "repeat(2, 1fr)",
            gap: "8px",
          }}
        >
          {ATELIER_LEATHERS.map((l) => {
            const isSelected = selectedLeather === l.name;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => onSelectLeather(l.name)}
                style={{
                  textAlign: "left",
                  padding: compact ? "8px 10px" : "10px 12px",
                  borderRadius: "3px",
                  background: isSelected ? "#123d32" : "#fff",
                  color: isSelected ? "#fff" : "#123d32",
                  border: isSelected
                    ? "1px solid #123d32"
                    : "1px solid #ded6ca",
                  cursor: "pointer",
                  transition: "all .15s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: compact ? "11px" : "12px",
                      fontWeight: 700,
                      letterSpacing: ".02em",
                    }}
                  >
                    {l.name}
                  </span>
                  {isSelected && <Check size={13} color="#dfc590" />}
                </div>
                <span
                  style={{
                    fontSize: compact ? "10px" : "10.5px",
                    opacity: isSelected ? 0.9 : 0.7,
                    fontStyle: "italic",
                    lineHeight: 1.2,
                  }}
                >
                  {l.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SHAPE OF DESIGN */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: compact ? "10px" : "11px",
              fontWeight: 700,
              letterSpacing: ".09em",
              textTransform: "uppercase",
              color: "#123d32",
            }}
          >
            Shape of Design:{" "}
            <strong style={{ color: "#5b1f2b" }}>{selectedShape}</strong>
          </span>
          <span style={{ fontSize: "11px", color: "#75847b" }}>
            Atelier Silhouette
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: compact
              ? "repeat(3, 1fr)"
              : "repeat(3, 1fr)",
            gap: "8px",
          }}
        >
          {ATELIER_SHAPES.map((s) => {
            const isSelected = selectedShape === s.name;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectShape(s.name)}
                style={{
                  textAlign: "left",
                  padding: compact ? "8px 8px" : "10px 12px",
                  borderRadius: "3px",
                  background: isSelected ? "#5b1f2b" : "#fff",
                  color: isSelected ? "#fff" : "#123d32",
                  border: isSelected
                    ? "1px solid #5b1f2b"
                    : "1px solid #ded6ca",
                  cursor: "pointer",
                  transition: "all .15s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: compact ? "11px" : "12px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {s.name}
                  </span>
                  {s.symbol ? (
                    <span
                      style={{
                        fontSize: "12px",
                        opacity: 0.9,
                        color: isSelected ? "#ffdfb5" : "#5b1f2b",
                      }}
                    >
                      {s.symbol}
                    </span>
                  ) : (
                    <Sparkles
                      size={12}
                      color={isSelected ? "#dfc590" : "#8a4f27"}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: compact ? "9.5px" : "10.5px",
                    opacity: isSelected ? 0.9 : 0.7,
                    lineHeight: 1.2,
                  }}
                >
                  {s.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Monogram input when Personal Monogram is chosen */}
        {isMonogramSelected && onMonogramChange && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px 12px",
              background: "#ffffff",
              border: "1px dashed #c4a974",
              borderRadius: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div>
              <label
                htmlFor="bespoke-monogram-input"
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  color: "#8a4f27",
                  display: "block",
                  marginBottom: "2px",
                }}
              >
                Initials (1–4 characters):
              </label>
              <input
                id="bespoke-monogram-input"
                type="text"
                maxLength={4}
                value={monogram}
                onChange={(e) =>
                  onMonogramChange(e.target.value.toUpperCase())
                }
                placeholder="e.g. WO"
                style={{
                  padding: "5px 8px",
                  border: "1px solid #123d32",
                  borderRadius: "2px",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  color: "#123d32",
                  width: "90px",
                  textTransform: "uppercase",
                  background: "#fbf9f6",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                }}
              >
                24k Gold Foil Embossing
              </span>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  fontFamily: "var(--dioka-font)",
                  color: "#bfa36f",
                  letterSpacing: "3px",
                  marginTop: "2px",
                  textShadow: "0 1px 1px rgba(0,0,0,0.2)",
                }}
              >
                {monogram ? monogram : "· · ·"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
