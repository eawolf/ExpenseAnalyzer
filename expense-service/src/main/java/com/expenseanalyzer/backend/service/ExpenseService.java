package com.expenseanalyzer.backend.service;

import com.expenseanalyzer.backend.dto.ExpenseDto;
import com.expenseanalyzer.backend.model.Expense;
import com.expenseanalyzer.backend.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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

    public List<Expense> getExpenses(UUID userId) {
        return expenseRepository.findByUserIdOrderByTransactionDateDesc(userId);
    }

    public void deleteExpense(UUID userId, UUID expenseId) {
        Expense expense = expenseRepository.findById(expenseId).orElseThrow(() -> new RuntimeException("Expense not found"));
        if (!expense.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        expenseRepository.delete(expense);
    }
}
