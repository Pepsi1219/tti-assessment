"use client";

import { useEffect } from "react";

/** Registers the PWA worker without caching authenticated evaluation data. */
export function PwaServiceWorker() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;

    void navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.error("Unable to register the app service worker", error);
    });
  }, []);

  return null;
}
