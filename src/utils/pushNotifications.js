// Native Browser System Push Notification Helper for ScrapVex

let notifiedIds = new Set();

export const requestNotificationPermission = async () => {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.error("Error requesting notification permission:", e);
      }
    }
  }
};

export const triggerNativeNotification = (title, body, notifId = null) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  if (notifId) {
    if (notifiedIds.has(notifId)) return;
    notifiedIds.add(notifId);
    if (notifiedIds.size > 100) {
      const first = Array.from(notifiedIds)[0];
      notifiedIds.delete(first);
    }
  }

  try {
    const options = {
      body: body || "You have a new update on ScrapVex",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: notifId || `scrapvex-notif-${Date.now()}`,
      renotify: true,
      vibrate: [200, 100, 200]
    };

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      }).catch(() => {
        new Notification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  } catch (e) {
    console.error("Native notification error:", e);
  }
};
