package com.nli.tagwise.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnnotatorDto {
    private Long id;
    private String name;
    private int completedTasks;

    public AnnotatorDto(Long id, String name, int completedTasks) {
        this.id = id;
        this.name = name;
        this.completedTasks = completedTasks;
    }
}