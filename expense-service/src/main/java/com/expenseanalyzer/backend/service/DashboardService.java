package com.expenseanalyzer.backend.service;

import com.expenseanalyzer.backend.dto.DashboardSummaryDto;
import com.expenseanalyzer.backend.model.Expense;
import com.expenseanalyzer.backend.model.Income;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ExpenseService expenseService;
    private final IncomeService incomeService;

    public DashboardSummaryDto getSummary(UUID userId, java.time.LocalDate startDate, java.time.LocalDate endDate) {
        List<Expense> expenses = expenseService.getExpenses(userId, startDate, endDate);
        List<Income> incomes = incomeService.getIncomes(userId, startDate, endDate);

        BigDecimal totalExpense = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalIncome = incomes.stream()
                .map(Income::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = totalIncome.subtract(totalExpense);

        List<DashboardSummaryDto.TransactionDto> transactions = new ArrayList<>();
        
        for (Expense e : expenses) {
            transactions.add(DashboardSummaryDto.TransactionDto.builder()
                    .id(e.getId())
                    .type("EXPENSE")
                    .amount(e.getAmount())
                    .title(String.join(", ", e.getCategories()) + (e.getMerchant() != null ? " - " + e.getMerchant() : ""))
                    .date(e.getTransactionDate())
                    .build());
        }

        for (Income i : incomes) {
            transactions.add(DashboardSummaryDto.TransactionDto.builder()
                    .id(i.getId())
                    .type("INCOME")
                    .amount(i.getAmount())
                    .title(i.getSource())
                    .date(i.getTransactionDate())
                    .build());
        }

        transactions.sort(Comparator.comparing(DashboardSummaryDto.TransactionDto::getDate).reversed());

        List<DashboardSummaryDto.TransactionDto> recentTransactions = transactions.stream()
                .limit(10)
                .collect(Collectors.toList());

        return DashboardSummaryDto.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(balance)
                .recentTransactions(recentTransactions)
                .build();
    }
}
