package com.expenseanalyzer.auth.repository;

import com.expenseanalyzer.auth.model.ResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;
import com.expenseanalyzer.auth.model.User;
import java.util.List;

public interface ResetTokenRepository extends JpaRepository<ResetToken, UUID> {
    Optional<ResetToken> findByTokenHashAndUsedFalse(String tokenHash);
    List<ResetToken> findByUserAndUsedFalse(User user);
}
