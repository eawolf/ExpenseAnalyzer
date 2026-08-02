package com.expenseanalyzer.auth.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(schema = "auth", name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phoneNumber;

    private String securityQuestion1;
    private String securityAnswer1Hash;

    private String securityQuestion2;
    private String securityAnswer2Hash;

    private String securityQuestion3;
    private String securityAnswer3Hash;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String profilePictureBase64;

    @Column(name = "currency")
    private String currency = "$";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "age")
    private Integer age;

    @Column(name = "gender")
    private String gender;

    @Column(name = "occupation")
    private String occupation;

    @Column(name = "primary_source_of_income")
    private String primarySourceOfIncome;

    @Column(name = "ai_consent")
    private Boolean aiConsent;

    @Column(name = "consent_completed", columnDefinition = "boolean default false")
    private Boolean consentCompleted = false;
}
