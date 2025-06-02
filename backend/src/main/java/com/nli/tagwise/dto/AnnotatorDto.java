package com.nli.tagwise.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AnnotatorDto {
    private Long id;
    private String name;
    private String email;
    private Long completedTasks;

}