package com.nli.tagwise.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DatasetDetailsDto {
    private Long id;
    private String name;
    private String description;
    private String classes;
    private double completionPercentage;
    private int totalPairs;
    private List<TextPairDto> samplePairs;
    private List<AnnotatorDto> assignedAnnotators;
}
