"use client";

import React from "react";
import { StoreProvider } from "@/lib/store-context";
import { GlobalModals } from "@/components/GlobalModals";
import { AtelierAudioPlayer } from "@/components/AtelierAudioPlayer";
import { AtelierSplashScreen } from "@/components/AtelierSplashScreen";
import { DesignerChatbox } from "@/components/DesignerChatbox";
import { ContentProvider } from "@/components/EditableContent";
import { usePathname } from "next/navigation";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname=usePathname();
  const admin = pathname.startsWith("/admin");
  const accountPage=["/sign-in","/join","/account","/auth/result"].includes(pathname);
  if (admin) return <>{children}</>;
  return (
    <ContentProvider><StoreProvider>
      {!accountPage && <AtelierSplashScreen />}
      {children}
      <GlobalModals />
      {!accountPage && <DesignerChatbox />}
      {!accountPage && <AtelierAudioPlayer />}
    </StoreProvider></ContentProvider>
  );
}
