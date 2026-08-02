package com.expenseanalyzer.backend.repository;

import com.expenseanalyzer.backend.model.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;


@Repository
public interface IncomeRepository extends JpaRepository<Income, UUID> {
    List<Income> findByUserIdOrderByTransactionDateDesc(UUID userId);
    List<Income> findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(UUID userId, LocalDateTime startDate, LocalDateTime endDate);
}
