package com.expenseanalyzer.auth.dto;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String emailOrPhone;
    private String otpCode; // If OTP was used
    private String resetToken; // If Recovery Link or Questions were used
    private String newPassword;
}
