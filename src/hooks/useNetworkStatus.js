import { useState, useEffect } from "react";
import { Network } from "@capacitor/network";
import { isNativeApp } from "../platform/platform";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (!isNativeApp()) return;

    // Check current status immediately
    Network.getStatus().then((status) => {
      setIsOnline(status.connected);
    });

    // Listen for network changes
    const listener = Network.addListener("networkStatusChange", (status) => {
      setIsOnline(status.connected);
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, []);

  return isOnline;
}
