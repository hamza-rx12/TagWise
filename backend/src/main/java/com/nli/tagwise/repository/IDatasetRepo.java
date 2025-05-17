package com.nli.tagwise.repository;

import com.nli.tagwise.models.Dataset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IDatasetRepo extends JpaRepository<Dataset, Long> {
}