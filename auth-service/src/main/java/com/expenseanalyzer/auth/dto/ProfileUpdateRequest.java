package com.expenseanalyzer.auth.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String name;
    private String email;
    private Integer age;
    private String gender;
    private String occupation;
    private String primarySourceOfIncome;
    private Boolean aiConsent;
}
