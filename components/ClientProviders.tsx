"use client";

import React from "react";
import { StoreProvider } from "@/lib/store-context";
import { GlobalModals } from "@/components/GlobalModals";
import { AtelierAudioPlayer } from "@/components/AtelierAudioPlayer";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      {children}
      <GlobalModals />
      <AtelierAudioPlayer />
    </StoreProvider>
  );
}
