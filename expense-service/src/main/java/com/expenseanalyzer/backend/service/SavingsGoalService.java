package com.expenseanalyzer.backend.service;

import com.expenseanalyzer.backend.dto.SavingsGoalDto;
import com.expenseanalyzer.backend.model.SavingsGoal;
import com.expenseanalyzer.backend.repository.SavingsGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;

    public Optional<SavingsGoal> getSavingsGoal(UUID userId, Integer year, Integer month) {
        return savingsGoalRepository.findByUserIdAndYearAndMonth(userId, year, month);
    }

    public SavingsGoal setSavingsGoal(UUID userId, SavingsGoalDto dto) {
        Optional<SavingsGoal> existing = savingsGoalRepository.findByUserIdAndYearAndMonth(userId, dto.getYear(), dto.getMonth());
        
        SavingsGoal goal;
        if (existing.isPresent()) {
            goal = existing.get();
            goal.setTargetAmount(dto.getTargetAmount());
        } else {
            goal = new SavingsGoal();
            goal.setUserId(userId);
            goal.setYear(dto.getYear());
            goal.setMonth(dto.getMonth());
            goal.setTargetAmount(dto.getTargetAmount());
        }
        
        return savingsGoalRepository.save(goal);
    }

    public void deleteSavingsGoal(UUID userId, Integer year, Integer month) {
        savingsGoalRepository.findByUserIdAndYearAndMonth(userId, year, month)
            .ifPresent(savingsGoalRepository::delete);
    }
}
