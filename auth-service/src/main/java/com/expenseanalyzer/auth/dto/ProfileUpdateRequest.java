package com.expenseanalyzer.auth.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String name;
    private String email;
}
