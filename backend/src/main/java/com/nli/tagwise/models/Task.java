package com.nli.tagwise.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@Entity
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "dataset_id", nullable = false)
    private Dataset dataset;

    @ManyToMany
    @JoinTable(
        name = "task_annotator",
        joinColumns = @JoinColumn(name = "task_id"),
        inverseJoinColumns = @JoinColumn(name = "annotator_id")
    )
    private List<User> annotators = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String text1;

    @Column(columnDefinition = "TEXT")
    private String text2;

    @ElementCollection
    @CollectionTable(name = "task_annotations", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "annotation")
    private List<String> annotations = new ArrayList<>(); // List of annotations from different annotators

    @ElementCollection
    @CollectionTable(name = "task_completion_status", joinColumns = @JoinColumn(name = "task_id"))
    @MapKeyJoinColumn(name = "annotator_id")
    @Column(name = "completed")
    private java.util.Map<User, Boolean> completionStatus = new java.util.HashMap<>();

    /**
     * Adds an annotator to this task.
     * @param annotator The annotator to add
     */
    public void addAnnotator(User annotator) {
        if (!annotators.contains(annotator)) {
            annotators.add(annotator);
            completionStatus.put(annotator, false);
        }
    }

    /**
     * Checks if the task is completed by all assigned annotators.
     * @return true if all annotators have completed the task
     */
    public boolean isCompleted() {
        if (annotators.isEmpty() || completionStatus.isEmpty()) {
            return false;
        }
        return completionStatus.values().stream().allMatch(Boolean::booleanValue);
    }

    /**
     * Sets the completion status for a specific annotator.
     * @param annotator The annotator
     * @param completed The completion status
     */
    public void setAnnotatorCompletionStatus(User annotator, boolean completed) {
        if (annotators.contains(annotator)) {
            completionStatus.put(annotator, completed);
        }
    }

    /**
     * Adds an annotation from an annotator.
     * @param annotation The annotation value
     */
    public void addAnnotation(String annotation) {
        annotations.add(annotation);
    }
}
