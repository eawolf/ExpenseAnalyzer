package com.expenseanalyzer.backend.controller;

import com.expenseanalyzer.backend.dto.IncomeDto;
import com.expenseanalyzer.backend.model.Income;
import com.expenseanalyzer.backend.service.IncomeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    @GetMapping
    public ResponseEntity<List<Income>> getIncomes(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate) {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(incomeService.getIncomes(userId, startDate, endDate));
    }

    @PostMapping
    public ResponseEntity<Income> addIncome(@Valid @RequestBody IncomeDto dto) {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(incomeService.addIncome(userId, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable UUID id) {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(userIdStr);
        incomeService.deleteIncome(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Income> updateIncome(@PathVariable UUID id, @Valid @RequestBody IncomeDto dto) {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(incomeService.updateIncome(userId, id, dto));
    }
}
