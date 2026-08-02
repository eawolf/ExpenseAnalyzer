package com.expenseanalyzer.backend.repository;

import com.expenseanalyzer.backend.model.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, UUID> {
    Optional<SavingsGoal> findByUserIdAndYearAndMonth(UUID userId, Integer year, Integer month);
}
