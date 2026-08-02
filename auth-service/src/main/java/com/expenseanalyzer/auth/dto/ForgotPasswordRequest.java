package com.expenseanalyzer.auth.dto;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String emailOrPhone;
    private String method; // EMAIL, SMS, QUESTIONS
    // For QUESTIONS method
    private String answer1;
    private String answer2;
    private String answer3;
}
