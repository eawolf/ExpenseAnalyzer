package com.expenseanalyzer.auth.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(schema = "auth", name = "otps")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Otp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "email_or_phone", nullable = false)
    private String identifier;

    @Column(nullable = false)
    private String otpCodeHash;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private boolean used = false;
}
