package com.expenseanalyzer.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.validation.constraints.NotEmpty;

@Data
public class ExpenseDto {
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotEmpty(message = "At least one category is required")
    private List<String> categories;

    private String merchant;
    private String notes;
    private LocalDateTime transactionDate;
}
