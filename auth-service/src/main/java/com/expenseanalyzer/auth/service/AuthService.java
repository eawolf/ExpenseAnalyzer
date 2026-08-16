package com.expenseanalyzer.auth.service;

import com.expenseanalyzer.auth.dto.AuthResponse;
import com.expenseanalyzer.auth.dto.LoginRequest;
import com.expenseanalyzer.auth.dto.RegisterRequest;
import com.expenseanalyzer.auth.dto.ProfileUpdateRequest;
import com.expenseanalyzer.auth.model.User;
import com.expenseanalyzer.auth.repository.UserRepository;
import com.expenseanalyzer.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        user.setPhoneNumber(request.getPhoneNumber());
        
        if (request.getSecurityQuestion1() != null && request.getSecurityAnswer1() != null) {
            user.setSecurityQuestion1(request.getSecurityQuestion1());
            user.setSecurityAnswer1Hash(passwordEncoder.encode(request.getSecurityAnswer1().toLowerCase().trim()));
        }
        
        if (request.getSecurityQuestion2() != null && request.getSecurityAnswer2() != null) {
            user.setSecurityQuestion2(request.getSecurityQuestion2());
            user.setSecurityAnswer2Hash(passwordEncoder.encode(request.getSecurityAnswer2().toLowerCase().trim()));
        }

        if (request.getSecurityQuestion3() != null && request.getSecurityAnswer3() != null) {
            user.setSecurityQuestion3(request.getSecurityQuestion3());
            user.setSecurityAnswer3Hash(passwordEncoder.encode(request.getSecurityAnswer3().toLowerCase().trim()));
        }

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser.getId(), savedUser.getEmail());

        return new AuthResponse(token, savedUser.getId().toString(), savedUser.getName(), savedUser.getEmail(), savedUser.getCurrency());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getId().toString(), user.getName(), user.getEmail(), user.getCurrency());
    }

    @Cacheable(value = "userProfile", key = "#userId")
    public com.expenseanalyzer.auth.dto.UserProfileDto getProfile(java.util.UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return com.expenseanalyzer.auth.dto.UserProfileDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profilePictureBase64(user.getProfilePictureBase64())
                .currency(user.getCurrency())
                .age(user.getAge())
                .gender(user.getGender())
                .occupation(user.getOccupation())
                .primarySourceOfIncome(user.getPrimarySourceOfIncome())
                .aiConsent(user.getAiConsent())
                .consentCompleted(user.getConsentCompleted())
                .build();
    }

    @CacheEvict(value = "userProfile", key = "#userId")
    public com.expenseanalyzer.auth.dto.UserProfileDto updateProfilePicture(java.util.UUID userId, String base64Image) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setProfilePictureBase64(base64Image);
        User saved = userRepository.save(user);
        return com.expenseanalyzer.auth.dto.UserProfileDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .profilePictureBase64(saved.getProfilePictureBase64())
                .currency(saved.getCurrency())
                .age(saved.getAge())
                .gender(saved.getGender())
                .aiConsent(saved.getAiConsent())
                .consentCompleted(saved.getConsentCompleted())
                .build();
    }

    @CacheEvict(value = "userProfile", key = "#userId")
    public com.expenseanalyzer.auth.dto.UserProfileDto removeProfilePicture(java.util.UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setProfilePictureBase64(null);
        User saved = userRepository.save(user);
        return com.expenseanalyzer.auth.dto.UserProfileDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .profilePictureBase64(saved.getProfilePictureBase64())
                .currency(saved.getCurrency())
                .age(saved.getAge())
                .gender(saved.getGender())
                .aiConsent(saved.getAiConsent())
                .consentCompleted(saved.getConsentCompleted())
                .build();
    }
    
    @CacheEvict(value = "userProfile", key = "#userId")
    public com.expenseanalyzer.auth.dto.UserProfileDto updateCurrency(java.util.UUID userId, String currency) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setCurrency(currency);
        User saved = userRepository.save(user);
        return com.expenseanalyzer.auth.dto.UserProfileDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .profilePictureBase64(saved.getProfilePictureBase64())
                .currency(saved.getCurrency())
                .age(saved.getAge())
                .gender(saved.getGender())
                .aiConsent(saved.getAiConsent())
                .consentCompleted(saved.getConsentCompleted())
                .build();
    }

    @CacheEvict(value = "userProfile", key = "#userId")
    public com.expenseanalyzer.auth.dto.UserProfileDto updateProfile(java.util.UUID userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email is already in use by another account.");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getAge() != null) {
            user.setAge(request.getAge());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getOccupation() != null) {
            user.setOccupation(request.getOccupation());
        }
        if (request.getPrimarySourceOfIncome() != null) {
            user.setPrimarySourceOfIncome(request.getPrimarySourceOfIncome());
        }
        if (request.getAiConsent() != null) {
            user.setAiConsent(request.getAiConsent());
        }
        User saved = userRepository.save(user);
        return com.expenseanalyzer.auth.dto.UserProfileDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .profilePictureBase64(saved.getProfilePictureBase64())
                .currency(saved.getCurrency())
                .age(saved.getAge())
                .gender(saved.getGender())
                .occupation(saved.getOccupation())
                .primarySourceOfIncome(saved.getPrimarySourceOfIncome())
                .aiConsent(saved.getAiConsent())
                .consentCompleted(saved.getConsentCompleted())
                .build();
    }

    public com.expenseanalyzer.auth.dto.UserProfileDto updateConsent(java.util.UUID userId, com.expenseanalyzer.auth.dto.ConsentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setAge(request.getAge());
        user.setGender(request.getGender());
        user.setOccupation(request.getOccupation());
        user.setPrimarySourceOfIncome(request.getPrimarySourceOfIncome());
        user.setAiConsent(request.getAiConsent());
        user.setConsentCompleted(true);
        User saved = userRepository.save(user);
        return com.expenseanalyzer.auth.dto.UserProfileDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .profilePictureBase64(saved.getProfilePictureBase64())
                .currency(saved.getCurrency())
                .age(saved.getAge())
                .gender(saved.getGender())
                .occupation(saved.getOccupation())
                .primarySourceOfIncome(saved.getPrimarySourceOfIncome())
                .aiConsent(saved.getAiConsent())
                .consentCompleted(saved.getConsentCompleted())
                .build();
    }
}
