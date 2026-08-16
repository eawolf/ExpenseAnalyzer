package com.expenseanalyzer.auth.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:3000}") // Externalized for deployment
public class LiveViewerController {

    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final AtomicInteger activeViewers = new AtomicInteger(0);

    @GetMapping(value = "/live-viewers", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        // Timeout set to 30 minutes. The client will reconnect if it drops.
        SseEmitter emitter = new SseEmitter(1800000L);
        emitters.add(emitter);

        int currentCount = activeViewers.incrementAndGet();
        broadcastCount(currentCount);

        emitter.onCompletion(() -> removeAndBroadcast(emitter));
        emitter.onTimeout(() -> removeAndBroadcast(emitter));
        emitter.onError(e -> removeAndBroadcast(emitter));

        return emitter;
    }

    private void removeAndBroadcast(SseEmitter emitter) {
        if (emitters.remove(emitter)) {
            int currentCount = activeViewers.decrementAndGet();
            broadcastCount(currentCount);
        }
    }

    private void broadcastCount(int count) {
        // Create an array of dead emitters to clean up
        java.util.List<SseEmitter> deadEmitters = new java.util.ArrayList<>();
        
        emitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("viewer-count")
                        .data(count));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        });
        
        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
            int newCount = activeViewers.addAndGet(-deadEmitters.size());
            // Recursive broadcast if some died during this broadcast
            if (activeViewers.get() != count) {
                broadcastCount(newCount);
            }
        }
    }
}
