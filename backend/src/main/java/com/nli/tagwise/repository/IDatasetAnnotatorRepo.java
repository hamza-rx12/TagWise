package com.nli.tagwise.repository;

import com.nli.tagwise.models.Dataset;
import com.nli.tagwise.models.DatasetAnnotator;
import com.nli.tagwise.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IDatasetAnnotatorRepo extends JpaRepository<DatasetAnnotator, Long> {
    List<DatasetAnnotator> findByDataset(Dataset dataset);
    List<DatasetAnnotator> findByAnnotator(User annotator);
}