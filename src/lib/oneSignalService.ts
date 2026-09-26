// ============================================================================
// File: src/lib/oneSignalService.ts
// Push Notification Service (OneSignal App ID: acc8a2bc-d54e-4261-b3d2-cc5c5f7b39d3)
// ח. סבן חומרי בניין (1994) בע״מ
// ============================================================================

import { playLocationChime } from "./location-chime";

export const ONESIGNAL_APP_ID = "acc8a2bc-d54e-4261-b3d2-cc5c5f7b39d3";

export interface CounterNotificationPayload {
  message: string;
  orderId?: string;
  branch?: string;
  timestamp?: string;
}

let isInitialized = false;

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: unknown) => void>;
    OneSignal?: {
      init: (options: { appId: string; allowLocalhostAsSecureOrigin?: boolean }) => Promise<void>;
      Notifications?: {
        requestPermission: () => Promise<string>;
        addEventListener: (event: string, handler: (event: unknown) => void) => void;
        removeEventListener: (event: string, handler: (event: unknown) => void) => void;
      };
    };
  }
}

/**
 * Initialize OneSignal Push Notifications
 */
export function initOneSignal() {
  if (typeof window === "undefined" || isInitialized) return;

  try {
    isInitialized = true;
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    // Check if OneSignal script is already loaded
    if (!document.getElementById("onesignal-sdk")) {
      const script = document.createElement("script");
      script.id = "onesignal-sdk";
      script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      script.defer = true;
      document.head.appendChild(script);
    }

    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await (OneSignal as { init: (options: { appId: string }) => Promise<void> }).init({
          appId: ONESIGNAL_APP_ID,
        });
      } catch (err) {
        console.warn("OneSignal initialization warning:", err);
      }
    });
  } catch (e) {
    console.warn("OneSignal script injection warning:", e);
  }
}

/**
 * Listen to counter notifications (both local counter dispatch & push messages)
 */
export function listenToCounterNotifications(
  callback: (notif: CounterNotificationPayload) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleCustomEvent = (event: Event) => {
    const custom = event as CustomEvent<{ order?: { id: string; productName: string } }>;
    if (custom.detail?.order) {
      callback({
        message: `פנייה חדשה עבור ${custom.detail.order.productName} נקלטה בדלפק`,
        orderId: custom.detail.order.id,
      });
    }
  };

  const handleCounterNotification = (event: Event) => {
    const custom = event as CustomEvent<CounterNotificationPayload>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  window.addEventListener("saban:storage:change", handleCustomEvent);
  window.addEventListener("saban:counter:notification", handleCounterNotification);

  return () => {
    window.removeEventListener("saban:storage:change", handleCustomEvent);
    window.removeEventListener("saban:counter:notification", handleCounterNotification);
  };
}

/**
 * Plays a crisp acoustic counter chime sound
 */
export function playChimeSound() {
  try {
    playLocationChime("counter_ring");
  } catch (e) {
    console.warn("Chime playback error:", e);
  }
}
