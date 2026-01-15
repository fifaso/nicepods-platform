// components/pwa-lifecycle.tsx
"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    workbox: any;
  }
}

export function PwaLifecycle() {
  const isRegistered = useRef(false);

  useEffect(() => {
    if (
      !isRegistered.current &&
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;
      wb.addEventListener("waiting", () => wb.messageSkipWaiting());
      wb.register();
      isRegistered.current = true;
    }
  }, []);

  return null;
}