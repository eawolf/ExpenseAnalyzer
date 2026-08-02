package com.expenseanalyzer.notification.service;

import com.expenseanalyzer.notification.model.NotificationEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final EmailService emailService;

    @KafkaListener(topics = "notifications", groupId = "notification-group")
    public void consume(NotificationEvent event) {
        log.info("--------------------------------------------------");
        log.info("Received notification event via Kafka: {}", event.getType());
        
        switch(event.getType()) {
            case "EMAIL_OTP":
                log.info("Sending real EMAIL OTP to {}: Your OTP is {}", event.getRecipient(), event.getContent());
                emailService.sendOtpEmail(event.getRecipient(), event.getContent());
                break;
            case "SMS_OTP":
                log.info("MOCK - Sending SMS OTP to {}: Your OTP is {}", event.getRecipient(), event.getContent());
                break;
            case "EMAIL_RESET_LINK":
                log.info("MOCK - Sending Reset Link to {}: Click here -> {}", event.getRecipient(), event.getContent());
                break;
            default:
                log.warn("Unknown notification type: {}", event.getType());
        }
        log.info("--------------------------------------------------");
    }
}
