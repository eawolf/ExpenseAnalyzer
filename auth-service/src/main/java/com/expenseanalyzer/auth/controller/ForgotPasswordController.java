package com.expenseanalyzer.auth.controller;

import com.expenseanalyzer.auth.dto.ForgotPasswordRequest;
import com.expenseanalyzer.auth.dto.ResetPasswordRequest;
import com.expenseanalyzer.auth.service.ForgotPasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/forgot-password")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    @PostMapping("/request")
    public ResponseEntity<?> requestRecovery(@RequestBody ForgotPasswordRequest request) {
        forgotPasswordService.requestRecovery(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        forgotPasswordService.resetPassword(request);
        return ResponseEntity.ok().build();
    }
}
