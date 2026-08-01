package com.expenseanalyzer.auth.dto;
import lombok.Builder;
import lombok.Data;
@Data
@Builder
public class UserProfileDto {
    private java.util.UUID id;
    private String name;
    private String email;
    private String profilePictureBase64;
    private String currency;
}
