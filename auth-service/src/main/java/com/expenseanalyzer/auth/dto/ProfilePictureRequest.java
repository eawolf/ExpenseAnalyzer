package com.expenseanalyzer.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfilePictureRequest {
    @NotBlank(message = "Base64 string is required")
    private String base64Image;
}
