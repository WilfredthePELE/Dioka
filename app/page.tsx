"use client";

import React from "react";
import { DiokaWritingHero } from "@/components/DiokaWritingHero";

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-[#06110e]">
      {/* 
        IMMERSIVE FULLSCREEN CINEMATIC VIDEO WITH ANIMATED WRITING OF DIOKA
        Clean, distraction-free full-screen atelier experience with liquid gold 
        calligraphy pen writing "DIOKA" and interactive Messenger concierge.
      */}
      <DiokaWritingHero />
    </main>
  );
}
