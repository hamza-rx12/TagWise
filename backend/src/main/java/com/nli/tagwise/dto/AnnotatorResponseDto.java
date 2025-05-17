package com.nli.tagwise.dto;

import com.nli.tagwise.models.Gender;
import com.nli.tagwise.models.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnnotatorResponseDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private Gender gender;
    private Boolean enabled;
    private Double spamScore;
    private Double qualityMetric;
}