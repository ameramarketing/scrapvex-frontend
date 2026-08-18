// Native Push & Local Notification Engine with Audio Chime for ScrapVex
import { LocalNotifications } from "@capacitor/local-notifications";
import { isNativeApp } from "../platform/platform";

let notifiedIds = new Set();

// Universal Ding-Dong Audio Chime Synthesizer
export const playNotificationSound = () => {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const playTone = (freq, start, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    };

    const now = ctx.currentTime;
    playTone(587.33, now, 0.25);        // D5
    playTone(880, now + 0.15, 0.45);     // A5
    playTone(1174.66, now + 0.3, 0.6);   // D6
  } catch (e) {
    console.warn("Audio chime error:", e.message);
  }
};

// Request Notification Permission on App / Web Startup
export const requestNotificationPermission = async () => {
  try {
    if (isNativeApp()) {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== "granted") {
        await LocalNotifications.requestPermissions();
      }
      // Create high-priority notification channel for Android 8.0+ (Play Store / APK friendly)
      try {
        await LocalNotifications.createChannel({
          id: "scrapvex_alerts",
          name: "ScrapVex Real-Time Alerts",
          description: "Instant alerts for pickup bookings, OTPs, and status updates",
          importance: 5, // MAX importance (Heads-up Status Banner + Sound + Vibration)
          visibility: 1,
          vibration: true,
          lights: true,
          lightColor: "#0b8f3a"
        });
      } catch (channelErr) {
        console.warn("Notification channel creation:", channelErr);
      }
    } else if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }
  } catch (e) {
    console.error("Error requesting notification permissions:", e);
  }
};

// Trigger Native Push / Local Notification with High Priority Sound & Vibration
export const triggerNativeNotification = async (title, body, notifId = null) => {
  if (notifId) {
    const idStr = String(notifId);
    if (notifiedIds.has(idStr)) return;
    notifiedIds.add(idStr);
    if (notifiedIds.size > 200) {
      const first = Array.from(notifiedIds)[0];
      notifiedIds.delete(first);
    }
  }

  // 1. Play universal audio chime
  playNotificationSound();

  // 2. Trigger native Android Local Notification (Heads-up Status Bar Banner)
  if (isNativeApp()) {
    try {
      const numId = notifId ? (Math.abs(hashCode(String(notifId))) % 2147483647) : Math.floor(Math.random() * 1000000);
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title || "ScrapVex Alert 🔔",
            body: body || "You have a new update on ScrapVex.",
            id: numId,
            schedule: { at: new Date(Date.now() + 50) }, // Trigger immediately
            channelId: "scrapvex_alerts",
            smallIcon: "ic_launcher",
            iconColor: "#0b8f3a",
            actionTypeId: "",
            extra: { notifId }
          }
        ]
      });
      return;
    } catch (nativeErr) {
      console.warn("Capacitor local notification schedule failed:", nativeErr);
    }
  }

  // 3. Web Browser Fallback (ServiceWorker or Web Notification API)
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      const options = {
        body: body || "You have a new update on ScrapVex",
        icon: "/02_App_Icon.png",
        badge: "/03_Favicon.png",
        tag: notifId || `scrapvex-notif-${Date.now()}`,
        renotify: true,
        vibrate: [200, 100, 200]
      };

      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, options);
        }).catch(() => {
          new Notification(title, options);
        });
      } else {
        new Notification(title, options);
      }
    } catch (e) {
      console.error("Web notification error:", e);
    }
  }
};

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
