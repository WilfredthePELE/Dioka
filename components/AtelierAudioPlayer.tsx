"use client";

import React, { useState, useEffect, useRef } from "react";
import { Music, Pause, Play, SkipForward, Volume2, VolumeX } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: "Afrobeat" | "Jazz";
  src: string;
}

const PLAYLIST: Track[] = [
  {
    id: "lagos-afrobeat",
    title: "Water No Get Enemy",
    artist: "Fela Kuti · Afrobeat & Jazz Fusion",
    genre: "Afrobeat",
    src: "/audio/lagos-atelier-afrobeat.mp3",
  },
  {
    id: "milano-jazz",
    title: "Milano Blue",
    artist: "Italian Atelier Lounge Jazz",
    genre: "Jazz",
    src: "/audio/milano-blue-jazz.mp3",
  },
];

export function AtelierAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.65);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = PLAYLIST[currentTrackIndex];

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const handleEnded = () => {
      // Auto-advance to next track in cycle
      setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Update track source when index changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = currentTrack.src;
    audio.currentTime = 0;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack.src, isPlaying]);

  // Sync volume & mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setHasInteracted(true);

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        zIndex: 45,
        fontFamily: "var(--dioka-sans)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "rgba(24, 20, 18, 0.94)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
          borderRadius: "32px",
          padding: isExpanded ? "8px 14px 8px 10px" : "8px 12px",
          color: "#fff",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          gap: "10px",
          maxWidth: isExpanded ? "380px" : "260px",
        }}
      >
        {/* Play/Pause Button with Pulsing Wave Indicator */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause background music" : "Play Afrobeat & Jazz background music"}
          title={isPlaying ? "Pause background music" : "Play Afrobeat & Jazz atelier sound"}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: isPlaying ? "#e09f3e" : "rgba(255, 255, 255, 0.12)",
            border: 0,
            color: isPlaying ? "#1c1410" : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.2s ease",
          }}
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} style={{ marginLeft: "2px" }} fill="currentColor" />}
        </button>

        {/* Track Info (Click to expand) */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: "120px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: isPlaying ? "#e09f3e" : "#bbb",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Music size={10} />
              {currentTrack.genre} Lounge
            </span>

            {/* Subtle animated equalizer bars */}
            {isPlaying && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "flex-end",
                  gap: "2px",
                  height: "10px",
                }}
              >
                <span className="animate-pulse" style={{ width: "2px", height: "8px", background: "#e09f3e", borderRadius: "1px" }} />
                <span className="animate-pulse" style={{ width: "2px", height: "10px", background: "#e09f3e", borderRadius: "1px", animationDelay: "150ms" }} />
                <span className="animate-pulse" style={{ width: "2px", height: "6px", background: "#e09f3e", borderRadius: "1px", animationDelay: "300ms" }} />
              </span>
            )}
          </div>

          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#fff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentTrack.title}
          </span>
        </div>

        {/* Extended controls: Next track, Volume & Mute */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            type="button"
            onClick={nextTrack}
            aria-label="Next track"
            title="Next track (Afrobeat / Jazz)"
            style={{
              background: "none",
              border: 0,
              color: "rgba(255, 255, 255, 0.75)",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <SkipForward size={14} />
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute music" : "Mute music"}
            style={{
              background: "none",
              border: 0,
              color: isMuted ? "#e09f3e" : "rgba(255, 255, 255, 0.75)",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {isExpanded && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              style={{
                width: "55px",
                accentColor: "#e09f3e",
                cursor: "pointer",
              }}
            />
          )}
        </div>
      </div>

      {/* Welcoming invitation pulse before first user play */}
      {!hasInteracted && !isPlaying && (
        <div
          onClick={togglePlay}
          style={{
            position: "absolute",
            bottom: "48px",
            left: "0",
            background: "#e09f3e",
            color: "#1c1410",
            fontSize: "11px",
            fontWeight: 700,
            padding: "5px 10px",
            borderRadius: "14px",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            letterSpacing: ".04em",
          }}
        >
          <Play size={10} fill="currentColor" /> Play Atelier Afrobeat & Jazz
        </div>
      )}
    </div>
  );
}
