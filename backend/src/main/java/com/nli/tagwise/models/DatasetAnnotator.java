package com.nli.tagwise.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@Entity
@Table(name = "dataset_annotator")
public class DatasetAnnotator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "dataset_id", nullable = false)
    private Dataset dataset;

    @ManyToOne
    @JoinColumn(name = "annotator_id", nullable = false)
    private User annotator;
}