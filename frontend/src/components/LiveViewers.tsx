"use client";

import { useEffect, useState } from 'react';

export default function LiveViewers() {
  const [liveCount, setLiveCount] = useState<number | null>(null);

  useEffect(() => {
    // Connect to the Spring Boot SSE endpoint
    const eventSource = new EventSource('/api-proxy/auth/auth/live-viewers');

    eventSource.addEventListener('viewer-count', (event) => {
      setLiveCount(Number(event.data));
    });

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      // EventSource automatically attempts to reconnect on error.
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-card/50 border border-border">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {liveCount !== null && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${liveCount !== null ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
        </span>
        <span>
          <strong className="text-foreground">{liveCount !== null ? liveCount : '...'}</strong> Live
        </span>
      </div>
      <div className="w-px h-3 bg-border"></div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
        </span>
        <span><strong className="text-foreground">0</strong> Busy</span>
      </div>
    </div>
  );
}
