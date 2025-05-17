package com.nli.tagwise.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DatasetListDto {
    private Long id;
    private String name;
    private double completionPercentage;
    private String classes;
    private String description;

    public DatasetListDto(Long id, String name, double completionPercentage, String classes, String description) {
        this.id = id;
        this.name = name;
        this.completionPercentage = completionPercentage;
        this.classes = classes;
        this.description = description;
    }
}