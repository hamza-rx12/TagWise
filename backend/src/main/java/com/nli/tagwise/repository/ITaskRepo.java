package com.nli.tagwise.repository;

import com.nli.tagwise.models.Dataset;
import com.nli.tagwise.models.Task;
import com.nli.tagwise.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ITaskRepo extends JpaRepository<Task, Long> {

        // Find tasks by dataset
        List<Task> findByDataset(Dataset dataset);

        // Find tasks by annotator
        @Query("SELECT t FROM Task t JOIN t.annotators a WHERE a = :annotator")
        List<Task> findByAnnotator(@Param("annotator") User annotator);

        // Find tasks by dataset and annotator
        @Query("SELECT t FROM Task t JOIN t.annotators a WHERE t.dataset = :dataset AND a = :annotator")
        List<Task> findByDatasetAndAnnotator(
                        @Param("dataset") Dataset dataset,
                        @Param("annotator") User annotator);

        // Count completed tasks for a dataset and annotator
        @Query("SELECT COUNT(t) FROM Task t JOIN t.completionStatus cs " +
                        "WHERE t.dataset = :dataset AND KEY(cs) = :annotator AND VALUE(cs) = true")
        long countCompletedTasksByDatasetAndAnnotator(
                        @Param("dataset") Dataset dataset,
                        @Param("annotator") User annotator);

        // Count tasks for a dataset and annotator
        @Query("SELECT COUNT(t) FROM Task t JOIN t.annotators a " +
                        "WHERE t.dataset = :dataset AND a = :annotator")
        long countTasksByDatasetAndAnnotator(
                        @Param("dataset") Dataset dataset,
                        @Param("annotator") User annotator);

        // Find tasks that have fewer than 3 annotators
        @Query("SELECT t FROM Task t WHERE SIZE(t.annotators) < 3")
        List<Task> findTasksWithFewerThanThreeAnnotators();

        // Count completed tasks for an annotator
        @Query("SELECT COUNT(t) FROM Task t JOIN t.completionStatus cs " +
                        "WHERE KEY(cs) = :annotator AND VALUE(cs) = true")
        long countCompletedTasksByAnnotator(@Param("annotator") User annotator);
}
