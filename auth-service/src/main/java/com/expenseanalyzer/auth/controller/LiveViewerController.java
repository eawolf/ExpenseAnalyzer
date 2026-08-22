package com.expenseanalyzer.auth.controller;

import com.expenseanalyzer.auth.repository.UserRepository;
import com.expenseanalyzer.auth.security.JwtService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class LiveViewerController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    // Track logged-in users: userId -> last heartbeat timestamp
    private final ConcurrentHashMap<String, Long> activeUsers = new ConcurrentHashMap<>();

    // Sessions expire after 60 seconds of no heartbeat
    private static final long SESSION_TIMEOUT_MS = 60_000;

    public LiveViewerController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    /**
     * Heartbeat from a logged-in user. Tracks by userId so same user
     * in multiple tabs = 1 live user.
     */
    @PostMapping("/live-viewers/heartbeat")
    public Map<String, Object> heartbeat(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String userId = extractUserId(authHeader);
        if (userId != null) {
            activeUsers.put(userId, System.currentTimeMillis());
        }
        cleanupExpiredSessions();
        return buildResponse();
    }

    /**
     * Called when user logs out or closes the tab.
     */
    @PostMapping("/live-viewers/unregister")
    public Map<String, String> unregisterSession(@RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        if (userId != null) {
            activeUsers.remove(userId);
        }
        return Map.of("status", "ok");
    }

    /**
     * Public GET — works without auth for landing page display.
     */
    @GetMapping("/live-viewers/stats")
    public Map<String, Object> getStats() {
        cleanupExpiredSessions();
        return buildResponse();
    }

    private String extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        try {
            String token = authHeader.substring(7);
            if (!jwtService.isTokenValid(token)) {
                return null;
            }
            return jwtService.extractUserId(token);
        } catch (Exception e) {
            return null;
        }
    }

    private void cleanupExpiredSessions() {
        long now = System.currentTimeMillis();
        activeUsers.entrySet().removeIf(entry ->
                (now - entry.getValue()) > SESSION_TIMEOUT_MS
        );
    }

    private Map<String, Object> buildResponse() {
        long totalUsers = userRepository.count();
        int liveCount = activeUsers.size();
        return Map.of(
                "totalRegisteredUsers", totalUsers,
                "liveViewers", liveCount
        );
    }
}
