package com.expenseanalyzer.backend.service;

import com.expenseanalyzer.backend.dto.IncomeDto;
import com.expenseanalyzer.backend.model.Income;
import com.expenseanalyzer.backend.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;

    public Income addIncome(UUID userId, IncomeDto dto) {
        Income income = new Income();
        income.setUserId(userId);
        income.setAmount(dto.getAmount());
        income.setSource(dto.getSource());
        income.setTransactionDate(dto.getTransactionDate() != null ? dto.getTransactionDate() : LocalDateTime.now());
        
        return incomeRepository.save(income);
    }

    public List<Income> getIncomes(UUID userId) {
        return incomeRepository.findByUserIdOrderByTransactionDateDesc(userId);
    }

    public void deleteIncome(UUID userId, UUID incomeId) {
        Income income = incomeRepository.findById(incomeId).orElseThrow(() -> new RuntimeException("Income not found"));
        if (!income.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        incomeRepository.delete(income);
    }
}
