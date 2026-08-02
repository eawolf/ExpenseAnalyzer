package com.expenseanalyzer.backend.service;

import com.expenseanalyzer.backend.dto.ExpenseDto;
import com.expenseanalyzer.backend.model.Expense;
import com.expenseanalyzer.backend.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public Expense addExpense(UUID userId, ExpenseDto dto) {
        Expense expense = new Expense();
        expense.setUserId(userId);
        expense.setAmount(dto.getAmount());
        expense.setCategories(dto.getCategories());
        expense.setMerchant(dto.getMerchant());
        expense.setNotes(dto.getNotes());
        expense.setTransactionDate(dto.getTransactionDate() != null ? dto.getTransactionDate() : LocalDateTime.now());
        
        return expenseRepository.save(expense);
    }

    public List<Expense> getExpenses(UUID userId, Integer year, Integer month) {
        if (year != null && month != null) {
            YearMonth yearMonth = YearMonth.of(year, month);
            LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
            LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59, 999999999);
            return expenseRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, startDate, endDate);
        }
        return expenseRepository.findByUserIdOrderByTransactionDateDesc(userId);
    }

    public void deleteExpense(UUID userId, UUID expenseId) {
        Expense expense = expenseRepository.findById(expenseId).orElseThrow(() -> new RuntimeException("Expense not found"));
        if (!expense.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        expenseRepository.delete(expense);
    }

    public Expense updateExpense(UUID userId, UUID expenseId, ExpenseDto dto) {
        Expense expense = expenseRepository.findById(expenseId).orElseThrow(() -> new RuntimeException("Expense not found"));
        if (!expense.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        expense.setAmount(dto.getAmount());
        expense.setCategories(dto.getCategories());
        expense.setMerchant(dto.getMerchant());
        expense.setNotes(dto.getNotes());
        if (dto.getTransactionDate() != null) {
            expense.setTransactionDate(dto.getTransactionDate());
        }
        
        return expenseRepository.save(expense);
    }
}
