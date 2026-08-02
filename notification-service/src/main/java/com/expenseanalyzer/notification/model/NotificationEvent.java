package com.expenseanalyzer.notification.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String type; // e.g. EMAIL_OTP, SMS_OTP, EMAIL_RESET_LINK
    private String recipient; // email address or phone number
    private String content; // The OTP code or reset token
}
