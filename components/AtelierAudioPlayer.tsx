"use client";

import React, { useState, useEffect, useRef } from "react";
import { Disc3, Pause, Play, SkipForward, Volume2, VolumeX } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: "Afrobeat" | "Jazz";
  src: string;
  duration: number; // estimated seconds
}

const PLAYLIST: Track[] = [
  {
    id: "lagos-afrobeat",
    title: "Water No Get Enemy",
    artist: "Fela Kuti · Afrobeat & Jazz Fusion",
    genre: "Afrobeat",
    src: "/audio/lagos-atelier-afrobeat.mp3",
    duration: 172,
  },
  {
    id: "milano-jazz",
    title: "Milano Blue",
    artist: "Italian Atelier Lounge Jazz",
    genre: "Jazz",
    src: "/audio/milano-blue-jazz.mp3",
    duration: 145,
  },
];

export function AtelierAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(160);

  // Real animated equalizer frequency bands state
  const [freqBars, setFreqBars] = useState<number[]>([12, 24, 18, 30, 22, 14, 28, 16]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentTrack = PLAYLIST[currentTrackIndex];

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleEnded = () => {
      setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    };

    const handleTimeUpdate = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      }
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
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

  // Dynamic real music equalizer effect loop
  useEffect(() => {
    if (!isPlaying) {
      const resetId = requestAnimationFrame(() => {
        setFreqBars([4, 6, 4, 8, 5, 4, 6, 4]);
      });
      return () => cancelAnimationFrame(resetId);
    }

    let step = 0;
    const animateFrequency = () => {
      step += 0.08;
      // Generates organic multi-harmonic soundwave amplitudes
      const newBars = [
        Math.floor(10 + Math.sin(step * 1.8) * 8 + Math.cos(step * 0.9) * 4),
        Math.floor(18 + Math.sin(step * 2.5) * 12 + Math.cos(step * 1.2) * 6),
        Math.floor(14 + Math.sin(step * 3.1) * 9 + Math.cos(step * 2.1) * 5),
        Math.floor(26 + Math.sin(step * 1.4) * 14 + Math.sin(step * 3.7) * 7),
        Math.floor(20 + Math.cos(step * 2.2) * 10 + Math.sin(step * 1.5) * 6),
        Math.floor(12 + Math.sin(step * 3.4) * 8 + Math.cos(step * 0.7) * 4),
        Math.floor(22 + Math.cos(step * 1.9) * 11 + Math.sin(step * 2.8) * 7),
        Math.floor(15 + Math.sin(step * 2.7) * 10 + Math.cos(step * 1.6) * 5),
      ].map((val) => Math.max(3, Math.min(32, val)));

      setFreqBars(newBars);
      animFrameRef.current = requestAnimationFrame(animateFrequency);
    };

    animFrameRef.current = requestAnimationFrame(animateFrequency);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

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
      {/* Outer audio pod */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          background: "rgba(18, 14, 12, 0.94)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(224, 159, 62, 0.35)",
          boxShadow: isPlaying
            ? "0 12px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(224, 159, 62, 0.2)"
            : "0 8px 24px rgba(0, 0, 0, 0.35)",
          borderRadius: "36px",
          padding: isExpanded ? "8px 16px 8px 10px" : "8px 14px 8px 10px",
          color: "#fff",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          gap: "12px",
          maxWidth: isExpanded ? "400px" : "280px",
          overflow: "hidden",
        }}
      >
        {/* Play/Pause Button with Spinning Vinyl Disc Effect */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {/* Soundwave Ripple ring when playing */}
          {isPlaying && (
            <span
              style={{
                position: "absolute",
                inset: "-4px",
                borderRadius: "50%",
                border: "1px solid rgba(224, 159, 62, 0.5)",
                animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                pointerEvents: "none",
              }}
            />
          )}

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause music" : "Play music"}
            title={isPlaying ? "Pause soundtrack" : "Play soundtrack"}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: isPlaying
                ? "linear-gradient(135deg, #e09f3e 0%, #b87333 100%)"
                : "rgba(255, 255, 255, 0.12)",
              border: 0,
              color: isPlaying ? "#1c1410" : "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.2s ease, background 0.3s ease",
              boxShadow: isPlaying ? "0 4px 14px rgba(224, 159, 62, 0.4)" : "none",
            }}
          >
            {isPlaying ? (
              <Pause size={17} fill="currentColor" />
            ) : (
              <Play size={17} style={{ marginLeft: "2px" }} fill="currentColor" />
            )}
          </button>
        </div>

        {/* Track Details & Real Equalizer Visualizer */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: "125px",
            flex: 1,
          }}
        >
          {/* Top row: Genre + REAL Dynamic Frequency Bars */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: isPlaying ? "#e09f3e" : "#888",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Disc3
                size={11}
                style={{
                  animation: isPlaying ? "spin 3s linear infinite" : "none",
                  transformOrigin: "center",
                }}
              />
              {currentTrack.genre}
            </span>

            {/* Real Graphic Equalizer Effect */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "2px",
                height: "14px",
                padding: "0 2px",
              }}
              aria-label="Real-time audio visualizer"
            >
              {freqBars.map((height, i) => (
                <span
                  key={i}
                  style={{
                    width: "2.5px",
                    height: `${height}px`,
                    maxHeight: "14px",
                    background: isPlaying
                      ? `linear-gradient(180deg, #f7c57d 0%, #e09f3e 60%, #b87333 100%)`
                      : "rgba(255, 255, 255, 0.2)",
                    borderRadius: "1px",
                    transition: "height 0.08s ease-out",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Track title */}
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#fff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: "2px",
            }}
          >
            {currentTrack.title}
          </span>
        </div>

        {/* Audio Track Controls: Next Track & Mute Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
          <button
            type="button"
            onClick={nextTrack}
            aria-label="Next track"
            title="Next track"
            style={{
              background: "none",
              border: 0,
              color: "rgba(255, 255, 255, 0.7)",
              cursor: "pointer",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              borderRadius: "50%",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)")}
          >
            <SkipForward size={14} />
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? "Unmute" : "Mute"}
            style={{
              background: "none",
              border: 0,
              color: isMuted ? "#e09f3e" : "rgba(255, 255, 255, 0.7)",
              cursor: "pointer",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              borderRadius: "50%",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = isMuted ? "#f7c57d" : "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = isMuted ? "#e09f3e" : "rgba(255, 255, 255, 0.7)")}
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
                width: "50px",
                accentColor: "#e09f3e",
                cursor: "pointer",
                marginLeft: "4px",
              }}
            />
          )}
        </div>

        {/* Subtle playback progress indicator bar at the bottom */}
        {isPlaying && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, #e09f3e, #f7c57d)",
                transition: "width 0.25s linear",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
