package com.expenseanalyzer.auth.controller;

import com.expenseanalyzer.auth.dto.AuthResponse;
import com.expenseanalyzer.auth.dto.LoginRequest;
import com.expenseanalyzer.auth.dto.ProfilePictureRequest;
import com.expenseanalyzer.auth.dto.ProfileUpdateRequest;
import com.expenseanalyzer.auth.dto.CurrencyRequest;
import com.expenseanalyzer.auth.dto.RegisterRequest;
import com.expenseanalyzer.auth.dto.UserProfileDto;
import com.expenseanalyzer.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getProfile(@RequestAttribute("userId") UUID userId) {
        return ResponseEntity.ok(authService.getProfile(userId));
    }

    @PutMapping("/me/picture")
    public ResponseEntity<UserProfileDto> updateProfilePicture(
            @RequestAttribute("userId") UUID userId,
            @RequestBody ProfilePictureRequest request) {
        return ResponseEntity.ok(authService.updateProfilePicture(userId, request.getBase64Image()));
    }

    @DeleteMapping("/me/picture")
    public ResponseEntity<UserProfileDto> removeProfilePicture(@RequestAttribute("userId") UUID userId) {
        return ResponseEntity.ok(authService.removeProfilePicture(userId));
    }

    @PutMapping("/me/currency")
    public ResponseEntity<UserProfileDto> updateCurrency(
            @RequestAttribute("userId") UUID userId,
            @RequestBody CurrencyRequest request) {
        return ResponseEntity.ok(authService.updateCurrency(userId, request.getCurrency()));
    }

    @PutMapping("/me/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @RequestAttribute("userId") UUID userId,
            @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(authService.updateProfile(userId, request));
    }

    @PutMapping("/me/consent")
    public ResponseEntity<UserProfileDto> updateConsent(
            @RequestAttribute("userId") UUID userId,
            @RequestBody com.expenseanalyzer.auth.dto.ConsentRequest request) {
        return ResponseEntity.ok(authService.updateConsent(userId, request));
    }
}
