package com.expenseanalyzer.auth.dto;

import lombok.Data;

@Data
public class ConsentRequest {
    private Integer age;
    private String gender;
    private String occupation;
    private String primarySourceOfIncome;
    private Boolean aiConsent;
}
