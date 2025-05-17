package com.nli.tagwise.repository;

import com.nli.tagwise.models.Dataset;
import com.nli.tagwise.models.Task;
import com.nli.tagwise.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ITaskRepo extends JpaRepository<Task, Long> {

    // Méthode 1: Utilisation de la convention de nommage Spring Data JPA
    long countByDatasetAndAnnotatorAndCompleted(Dataset dataset, User annotator, boolean completed);

    // Méthode alternative 2: Avec requête JPQL explicite
    @Query("SELECT COUNT(t) FROM Task t WHERE t.dataset = :dataset AND t.annotator = :annotator AND t.completed = :completed")
    long countTasksByDatasetAndAnnotator(
            @Param("dataset") Dataset dataset,
            @Param("annotator") User annotator,
            @Param("completed") boolean completed);
}