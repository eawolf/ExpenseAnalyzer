package com.expenseanalyzer.notification.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;

    public void sendOtpEmail(String recipient, String otpCode) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(recipient);
            helper.setSubject("ExpenseAnalyzer - Your Password Reset Code");

            String htmlContent = String.format(
                "<html>" +
                "<body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>" +
                "  <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>" +
                "    <h2 style='color: #4f46e5; text-align: center;'>ExpenseAnalyzer</h2>" +
                "    <p style='color: #333333; font-size: 16px;'>Hello,</p>" +
                "    <p style='color: #333333; font-size: 16px;'>We received a request to reset your password. Use the code below to securely reset it:</p>" +
                "    <div style='text-align: center; margin: 30px 0;'>" +
                "      <span style='background-color: #f3f4f6; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #111827; border-radius: 8px; border: 1px solid #e5e7eb;'>%s</span>" +
                "    </div>" +
                "    <p style='color: #666666; font-size: 14px; text-align: center;'>This code will expire in 10 minutes.</p>" +
                "    <p style='color: #999999; font-size: 12px; text-align: center; margin-top: 30px;'>If you did not request this code, please safely ignore this email.</p>" +
                "  </div>" +
                "</body>" +
                "</html>", otpCode);

            helper.setText(htmlContent, true); // true indicates HTML

            javaMailSender.send(message);
            log.info("Successfully sent OTP email to: {}", recipient);
        } catch (MessagingException e) {
            log.error("Failed to send OTP email to: {}", recipient, e);
        }
    }
}
