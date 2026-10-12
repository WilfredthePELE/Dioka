"use client";

import { DiokaMessenger } from "@/components/DiokaMessenger";

// Re-export DiokaMessenger as DesignerChatbox for complete backward compatibility
export function DesignerChatbox() {
  return <DiokaMessenger />;
}
