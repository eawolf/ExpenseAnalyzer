package com.expenseanalyzer.auth.repository;

import com.expenseanalyzer.auth.model.Otp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OtpRepository extends JpaRepository<Otp, UUID> {
    Optional<Otp> findFirstByIdentifierAndUsedFalseOrderByExpiresAtDesc(String identifier);
}
