package com.expenseanalyzer.auth.service;

import com.expenseanalyzer.auth.dto.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendNotification(NotificationEvent event) {
        log.info("Producing notification event -> {}", event);
        kafkaTemplate.send("notifications", event);
    }
}
