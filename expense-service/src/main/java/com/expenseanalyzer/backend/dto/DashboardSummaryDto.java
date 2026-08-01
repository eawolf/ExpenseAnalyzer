package com.expenseanalyzer.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class DashboardSummaryDto {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private List<TransactionDto> recentTransactions;

    @Data
    @Builder
    public static class TransactionDto {
        private UUID id;
        private String type; // "INCOME" or "EXPENSE"
        private BigDecimal amount;
        private String title; // source or category
        private LocalDateTime date;
    }
}
