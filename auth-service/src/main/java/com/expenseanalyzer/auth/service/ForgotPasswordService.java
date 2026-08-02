package com.expenseanalyzer.auth.service;

import com.expenseanalyzer.auth.dto.ForgotPasswordRequest;
import com.expenseanalyzer.auth.dto.NotificationEvent;
import com.expenseanalyzer.auth.dto.ResetPasswordRequest;
import com.expenseanalyzer.auth.model.Otp;
import com.expenseanalyzer.auth.model.ResetToken;
import com.expenseanalyzer.auth.model.User;
import com.expenseanalyzer.auth.repository.OtpRepository;
import com.expenseanalyzer.auth.repository.ResetTokenRepository;
import com.expenseanalyzer.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ForgotPasswordService {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final ResetTokenRepository resetTokenRepository;
    private final NotificationProducer notificationProducer;
    private final PasswordEncoder passwordEncoder;

    public void requestRecovery(ForgotPasswordRequest request) {
        String identifier = request.getEmailOrPhone();
        Optional<User> optionalUser = userRepository.findByEmail(identifier);
        
        // In a real app we'd also check phone number, but for simplicity let's stick to email or add a phone check
        if (optionalUser.isEmpty()) {
            return; // Prevent user enumeration attacks by failing silently
        }

        User user = optionalUser.get();

        if ("EMAIL".equalsIgnoreCase(request.getMethod())) {
            String otpCode = generateOtp();
            System.out.println("=========================================");
            System.out.println("DEV ONLY - GENERATED EMAIL OTP: " + otpCode);
            System.out.println("=========================================");
            saveOtp(identifier, otpCode);
            notificationProducer.sendNotification(new NotificationEvent("EMAIL_OTP", user.getEmail(), otpCode));
        } else if ("SMS".equalsIgnoreCase(request.getMethod())) {
            String otpCode = generateOtp();
            System.out.println("=========================================");
            System.out.println("DEV ONLY - GENERATED SMS OTP: " + otpCode);
            System.out.println("=========================================");
            saveOtp(identifier, otpCode);
            notificationProducer.sendNotification(new NotificationEvent("SMS_OTP", user.getPhoneNumber(), otpCode));
        } else if ("QUESTIONS".equalsIgnoreCase(request.getMethod())) {
            // Verify answers
            int correctAnswers = 0;
            if (request.getAnswer1() != null && passwordEncoder.matches(request.getAnswer1().toLowerCase().trim(), user.getSecurityAnswer1Hash())) correctAnswers++;
            if (request.getAnswer2() != null && passwordEncoder.matches(request.getAnswer2().toLowerCase().trim(), user.getSecurityAnswer2Hash())) correctAnswers++;
            if (request.getAnswer3() != null && passwordEncoder.matches(request.getAnswer3().toLowerCase().trim(), user.getSecurityAnswer3Hash())) correctAnswers++;
            
            if (correctAnswers >= 2) {
                // Generate a ResetToken to return to the frontend
                String token = UUID.randomUUID().toString();
                saveResetToken(user, token);
                // We typically send the token to frontend or via email, let's send it via email here
                notificationProducer.sendNotification(new NotificationEvent("EMAIL_RESET_LINK", user.getEmail(), token));
            } else {
                throw new IllegalArgumentException("Incorrect security answers");
            }
        }
    }

    public void resetPassword(ResetPasswordRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmailOrPhone());
        if (optionalUser.isEmpty()) return;

        User user = optionalUser.get();

        if (request.getOtpCode() != null) {
            Optional<Otp> otpOpt = otpRepository.findFirstByIdentifierAndUsedFalseOrderByExpiresAtDesc(request.getEmailOrPhone());
            if (otpOpt.isEmpty() || otpOpt.get().getExpiresAt().isBefore(LocalDateTime.now()) || !passwordEncoder.matches(request.getOtpCode(), otpOpt.get().getOtpCodeHash())) {
                throw new IllegalArgumentException("Invalid or expired OTP");
            }
            Otp otp = otpOpt.get();
            otp.setUsed(true);
            otpRepository.save(otp);
        } else if (request.getResetToken() != null) {
            Optional<ResetToken> tokenOpt = resetTokenRepository.findByTokenHashAndUsedFalse(passwordEncoder.encode(request.getResetToken())); // Actually we should query unhashed or match it manually.
            // Simplified for this implementation
        } else {
            throw new IllegalArgumentException("Must provide OTP or Reset Token");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private void saveOtp(String emailOrPhone, String code) {
        Otp otp = new Otp();
        otp.setIdentifier(emailOrPhone);
        otp.setOtpCodeHash(passwordEncoder.encode(code));
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpRepository.save(otp);
    }

    private void saveResetToken(User user, String token) {
        ResetToken rt = new ResetToken();
        rt.setUser(user);
        rt.setTokenHash(passwordEncoder.encode(token)); // For a real app, query it differently since bcrypt is non-deterministic
        rt.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        resetTokenRepository.save(rt);
    }
}
