package com.expenseanalyzer.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(schema = "finance", name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private BigDecimal amount;

    // Legacy column to bypass NOT NULL constraint for existing DB schema
    @Column(name = "category", nullable = false)
    private String legacyCategory = "Legacy";

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(schema = "finance", name = "expense_categories", joinColumns = @JoinColumn(name = "expense_id"))
    @Column(name = "category")
    private List<String> categories = new ArrayList<>(); // e.g., Food, Travel, Utilities

    private String merchant; // e.g., Amazon, Starbucks

    private String notes;

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;
}
