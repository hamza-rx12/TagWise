package com.nli.tagwise.services;

import com.nli.tagwise.dto.AssignAnnotatorDto;
import com.nli.tagwise.models.Dataset;
import com.nli.tagwise.models.DatasetAnnotator;
import com.nli.tagwise.models.Task;
import com.nli.tagwise.models.User;
import com.nli.tagwise.repository.IDatasetAnnotatorRepo;
import com.nli.tagwise.repository.IDatasetRepo;
import com.nli.tagwise.repository.ITaskRepo;
import com.nli.tagwise.repository.IUserRepo;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TaskService {
    private final ITaskRepo taskRepo;
    private final IDatasetRepo datasetRepo;
    private final IUserRepo userRepo;
    private final IDatasetAnnotatorRepo datasetAnnotatorRepo;

    public TaskService(ITaskRepo taskRepo, IDatasetRepo datasetRepo, IUserRepo userRepo, IDatasetAnnotatorRepo datasetAnnotatorRepo) {
        this.taskRepo = taskRepo;
        this.datasetRepo = datasetRepo;
        this.userRepo = userRepo;
        this.datasetAnnotatorRepo = datasetAnnotatorRepo;
    }

    public void assignAnnotators(AssignAnnotatorDto dto) {
        Dataset dataset = datasetRepo.findById(dto.getDatasetId())
                .orElseThrow(() -> new IllegalArgumentException("Dataset not found"));
        User annotator = userRepo.findById(dto.getAnnotatorId())
                .orElseThrow(() -> new IllegalArgumentException("Annotator not found"));

        // Create DatasetAnnotator mapping
        DatasetAnnotator datasetAnnotator = new DatasetAnnotator();
        datasetAnnotator.setDataset(dataset);
        datasetAnnotator.setAnnotator(annotator);
        datasetAnnotatorRepo.save(datasetAnnotator);

        // Generate tasks (example: split dataset file into text pairs)
        List<Task> tasks = generateTasksFromDataset(dataset, annotator);
        taskRepo.saveAll(tasks);
    }

    private List<Task> generateTasksFromDataset(Dataset dataset, User annotator) {
        // Placeholder: Parse dataset file and create text pairs
        List<Task> tasks = new ArrayList<>();

        Task task = new Task();
        task.setDataset(dataset);
        task.setAnnotator(annotator);
        task.setText1("Sample text 1");
        task.setText2("Sample text 2");
        task.setCompleted(false);
        tasks.add(task);
        return tasks;
    }

    public void removeAnnotator(Long datasetId, Long annotatorId) {
        Dataset dataset = datasetRepo.findById(datasetId)
                .orElseThrow(() -> new IllegalArgumentException("Dataset not found"));
        User annotator = userRepo.findById(annotatorId)
                .orElseThrow(() -> new IllegalArgumentException("Annotator not found"));

        DatasetAnnotator datasetAnnotator = datasetAnnotatorRepo.findByDataset(dataset).stream()
                .filter(da -> da.getAnnotator().getId().equals(annotatorId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Annotator not assigned"));

        datasetAnnotatorRepo.delete(datasetAnnotator);
        // Note: Tasks remain in database as per requirement
    }
}