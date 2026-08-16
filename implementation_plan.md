# Implement Live Viewer Tracking using SSE

The goal is to implement real-time tracking of active viewers on the homepage using Server-Sent Events (SSE). This is an elegant, lightweight alternative to full WebSockets for one-way data streaming (Server -> Client).

## Open Questions
> [!NOTE]
> Currently, the solution uses an in-memory counter and emitter list. This is perfect for a single instance of uth-service. If you ever scale to multiple uth-service instances in a cluster, we would need to introduce Redis Pub/Sub to sync the counts across instances. For now, in-memory is the simplest and most performant approach. Do you agree with this MVP approach?

## Proposed Changes

### Backend (Auth Service)

#### [NEW] LiveViewerController.java (in com.expenseanalyzer.auth.controller)
- Create a new REST controller with a @GetMapping("/live-viewers") endpoint.
- Return an SseEmitter object.
- Maintain a thread-safe list CopyOnWriteArrayList<SseEmitter> of active connections.
- Maintain an AtomicInteger for the total live viewer count.
- On new connection: Add emitter, increment count, broadcast new count to all active emitters.
- On disconnect/timeout: Remove emitter, decrement count, broadcast new count.

### Frontend (Next.js)

#### [MODIFY] rontend/src/app/page.tsx
- Convert the footer or the component holding the live viewers into a Client Component (using "use client" directive, or extract it to a separate component like LiveViewers.tsx).
- Use the useEffect hook to instantiate an EventSource connecting to http://localhost:8081/api/auth/live-viewers.
- Listen for messages and update a React state variable liveCount.
- Display the dynamic liveCount instead of the hardcoded 243.

## Verification Plan

### Manual Verification
- Start the uth-service and Next.js frontend.
- Open the homepage in multiple browser tabs (or different browsers).
- Verify that the live viewer count increments for each new tab opened.
- Close a tab and verify that the count decrements for the remaining tabs in real-time.
