package com.nli.tagwise.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Long id;
    private Long datasetId;
    private Long annotatorId;
    private String text1;
    private String text2;
    private String annotation;
    private boolean completed;
}