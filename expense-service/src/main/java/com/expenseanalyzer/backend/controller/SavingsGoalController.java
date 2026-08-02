package com.expenseanalyzer.backend.controller;

import com.expenseanalyzer.backend.dto.SavingsGoalDto;
import com.expenseanalyzer.backend.model.SavingsGoal;
import com.expenseanalyzer.backend.service.SavingsGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.Optional;

@RestController
@RequestMapping("/api/savings-goal")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    @GetMapping
    public ResponseEntity<SavingsGoal> getSavingsGoal(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(userIdStr);
        
        Optional<SavingsGoal> goal = savingsGoalService.getSavingsGoal(userId, year, month);
        return goal.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping
    public ResponseEntity<SavingsGoal> setSavingsGoal(@Valid @RequestBody SavingsGoalDto dto) {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(userIdStr);
        
        return ResponseEntity.ok(savingsGoalService.setSavingsGoal(userId, dto));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteSavingsGoal(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(userIdStr);
        
        savingsGoalService.deleteSavingsGoal(userId, year, month);
        return ResponseEntity.noContent().build();
    }
}
