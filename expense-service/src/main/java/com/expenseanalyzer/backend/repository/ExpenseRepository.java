package com.expenseanalyzer.backend.repository;

import com.expenseanalyzer.backend.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

import java.time.LocalDateTime;


@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    List<Expense> findByUserIdOrderByTransactionDateDesc(UUID userId);
    List<Expense> findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(UUID userId, LocalDateTime startDate, LocalDateTime endDate);
}
