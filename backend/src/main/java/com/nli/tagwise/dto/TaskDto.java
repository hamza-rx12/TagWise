package com.nli.tagwise.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Long id;
    private Long datasetId;
    private List<Long> annotatorIds;
    private String text1;
    private String text2;
    private List<String> annotations;
    private Map<Long, Boolean> completionStatus;

    // Constructor for creating a new task
    public TaskDto(Long datasetId, List<Long> annotatorIds, String text1, String text2) {
        this.datasetId = datasetId;
        this.annotatorIds = annotatorIds;
        this.text1 = text1;
        this.text2 = text2;
    }

    // Constructor for annotator view (simplified)
    public TaskDto(Long id, String text1, String text2, boolean completed) {
        this.id = id;
        this.text1 = text1;
        this.text2 = text2;
        // For annotator view, we only care about their own completion status
        // This will be set by the service layer
    }
}
