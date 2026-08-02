package com.expenseanalyzer.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class SavingsGoalDto {
    @NotNull(message = "Year is required")
    private Integer year;

    @NotNull(message = "Month is required")
    private Integer month;

    @NotNull(message = "Target amount is required")
    private BigDecimal targetAmount;
}
