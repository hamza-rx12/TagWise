package com.nli.tagwise.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@Entity
public class Dataset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String classes; // Semicolon-separated classes (e.g., "positive;negative")

    @Column(columnDefinition = "TEXT")
    private String filePath; // Path to stored dataset file

    @OneToMany(mappedBy = "dataset", cascade = CascadeType.ALL)
    private List<Task> tasks;

    @OneToMany(mappedBy = "dataset", cascade = CascadeType.ALL)
    private List<DatasetAnnotator> annotators;

    @Transient
    public double getCompletionPercentage() {
        if (tasks == null || tasks.isEmpty()) return 0;
        long completed = tasks.stream().filter(Task::isCompleted).count();
        return (double) completed / tasks.size() * 100;
    }
}