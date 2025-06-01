package com.nli.tagwise.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DatasetAnnotatorDto {
    private Long id;
    private Long annotatorId;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private boolean enabled;
}