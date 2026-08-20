"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-2 rounded-full bg-amber-500/95 border border-amber-400/30 px-3.5 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold text-slate-950 shadow-xl backdrop-blur-md transition-all max-w-[calc(100vw-2rem)] truncate">
      <WifiOff className="h-3.5 w-3.5" />
      <span>Offline Mode. Viewing cached data.</span>
    </div>
  );
}