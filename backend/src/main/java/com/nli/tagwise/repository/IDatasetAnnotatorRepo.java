package com.nli.tagwise.repository;

import com.nli.tagwise.models.Dataset;
import com.nli.tagwise.models.DatasetAnnotator;
import com.nli.tagwise.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IDatasetAnnotatorRepo extends JpaRepository<DatasetAnnotator, Long> {
    List<DatasetAnnotator> findByDataset(Dataset dataset);

    List<DatasetAnnotator> findByAnnotator(User annotator);

    // Optional<Dataset> findByDatasetAndAnnotator(Dataset dataset, User annotator);

    void deleteByDatasetAndAnnotator(Dataset dataset, User annotator);
}