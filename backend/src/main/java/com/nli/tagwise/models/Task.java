package com.nli.tagwise.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @ManyToOne
    @JoinColumn(name = "annotator_id", nullable = false)
    private User annotator;

    @Column(columnDefinition = "TEXT")
    private String text1;

    @Column(columnDefinition = "TEXT")
    private String text2;

    private String annotation; // Assigned class (e.g., "positive")

    private boolean completed;
}