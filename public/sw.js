// This worker intentionally does not cache pages or API responses: evaluation
// data remains private and is always read through the authenticated application.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
