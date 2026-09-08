"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Users, Eye } from 'lucide-react';

export default function LiveViewers() {
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (token) {
      // Logged-in user: send heartbeat with JWT
      try {
        const res = await fetch('/api-proxy/auth/auth/live-viewers/heartbeat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setLiveCount(data.liveViewers);
          setTotalUsers(data.totalRegisteredUsers);
          return;
        }
      } catch {
        // fall through to public stats
      }
    }

    // Not logged in or heartbeat failed: use public stats endpoint
    try {
      const res = await fetch('/api-proxy/auth/auth/live-viewers/stats');
      if (res.ok) {
        const data = await res.json();
        setLiveCount(data.liveViewers);
        setTotalUsers(data.totalRegisteredUsers);
      }
    } catch {
      // auth-service not ready yet
    }
  }, []);

  useEffect(() => {
    fetchStats();
    intervalRef.current = setInterval(fetchStats, 30000);

    const unregister = () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const blob = new Blob(
          [JSON.stringify({ userId })],
          { type: 'application/json' }
        );
        navigator.sendBeacon('/api-proxy/auth/auth/live-viewers/unregister', blob);
      }
    };

    window.addEventListener('beforeunload', unregister);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('beforeunload', unregister);
      unregister();
    };
  }, [fetchStats]);

  return (
    <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-card/50 border border-border">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {liveCount !== null && liveCount > 0 && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${liveCount !== null && liveCount > 0 ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
        </span>
        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
        <span>
          <strong className="text-foreground">{liveCount !== null ? liveCount : '...'}</strong> Online
        </span>
      </div>
      <div className="w-px h-3 bg-border"></div>
      <div className="flex items-center gap-2">
        <Users className="w-3.5 h-3.5 text-muted-foreground" />
        <span>
          <strong className="text-foreground">{totalUsers !== null ? totalUsers : '...'}</strong> Users
        </span>
      </div>
    </div>
  );
}
