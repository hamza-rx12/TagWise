package com.nli.tagwise.services;

import com.nli.tagwise.dto.AssignAnnotatorDto;
import com.nli.tagwise.dto.TaskDto;
import com.nli.tagwise.models.Dataset;
import com.nli.tagwise.models.DatasetAnnotator;
import com.nli.tagwise.models.Task;
import com.nli.tagwise.models.User;
import com.nli.tagwise.repository.IDatasetAnnotatorRepo;
import com.nli.tagwise.repository.IDatasetRepo;
import com.nli.tagwise.repository.ITaskRepo;
import com.nli.tagwise.repository.IUserRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TaskService {
    private final ITaskRepo taskRepo;
    private final IDatasetRepo datasetRepo;
    private final IUserRepo userRepo;
    private final IDatasetAnnotatorRepo datasetAnnotatorRepo;

    public TaskService(ITaskRepo taskRepo, IDatasetRepo datasetRepo, IUserRepo userRepo,
            IDatasetAnnotatorRepo datasetAnnotatorRepo) {
        this.taskRepo = taskRepo;
        this.datasetRepo = datasetRepo;
        this.userRepo = userRepo;
        this.datasetAnnotatorRepo = datasetAnnotatorRepo;
    }

    @Transactional
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

        // Get existing tasks for this dataset or create new ones
        List<Task> existingTasks = taskRepo.findByDataset(dataset);

        if (existingTasks.isEmpty()) {
            // Generate new tasks for this dataset
            List<Task> newTasks = generateTasksFromDataset(dataset);

            // Add the annotator to each task
            for (Task task : newTasks) {
                task.addAnnotator(annotator);
            }

            taskRepo.saveAll(newTasks);
        } else {
            // Add this annotator to existing tasks
            for (Task task : existingTasks) {
                task.addAnnotator(annotator);
            }

            taskRepo.saveAll(existingTasks);
        }
    }

    private List<Task> generateTasksFromDataset(Dataset dataset) {
        // Placeholder: Parse dataset file and create text pairs
        List<Task> tasks = new ArrayList<>();

        // In a real implementation, this would parse the dataset file
        // and create tasks based on the content

        Task task = new Task();
        task.setDataset(dataset);
        task.setText1("Sample text 1");
        task.setText2("Sample text 2");
        tasks.add(task);

        return tasks;
    }

    @Transactional
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

        // Remove annotator from tasks but keep the tasks
        List<Task> tasks = taskRepo.findByDatasetAndAnnotator(dataset, annotator);
        for (Task task : tasks) {
            task.getAnnotators().remove(annotator);
            task.getCompletionStatus().remove(annotator);
        }
        taskRepo.saveAll(tasks);
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getTasksForAnnotator(Long annotatorId) {
        User annotator = userRepo.findById(annotatorId)
                .orElseThrow(() -> new IllegalArgumentException("Annotator not found"));

        List<Task> tasks = taskRepo.findByAnnotator(annotator);

        return tasks.stream().map(task -> {
            TaskDto dto = new TaskDto();
            dto.setId(task.getId());
            dto.setDatasetId(task.getDataset().getId());
            dto.setText1(task.getText1());
            dto.setText2(task.getText2());

            // Get completion status for this annotator
            Boolean completed = task.getCompletionStatus().get(annotator);
            Map<Long, Boolean> completionStatus = new HashMap<>();
            completionStatus.put(annotatorId, completed != null ? completed : false);
            dto.setCompletionStatus(completionStatus);

            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getTasksForDataset(Long datasetId) {
        Dataset dataset = datasetRepo.findById(datasetId)
                .orElseThrow(() -> new IllegalArgumentException("Dataset not found"));

        List<Task> tasks = taskRepo.findByDataset(dataset);

        return tasks.stream().map(task -> {
            TaskDto dto = new TaskDto();
            dto.setId(task.getId());
            dto.setDatasetId(datasetId);
            dto.setText1(task.getText1());
            dto.setText2(task.getText2());

            // Get all annotator IDs
            List<Long> annotatorIds = task.getAnnotators().stream()
                    .map(User::getId)
                    .collect(Collectors.toList());
            dto.setAnnotatorIds(annotatorIds);

            // Get all annotations
            dto.setAnnotations(task.getAnnotations());

            // Get completion status for all annotators
            Map<Long, Boolean> completionStatus = new HashMap<>();
            task.getCompletionStatus().forEach((user, status) -> completionStatus.put(user.getId(), status));
            dto.setCompletionStatus(completionStatus);

            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public TaskDto submitAnnotation(Long taskId, Long annotatorId, String annotation) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        User annotator = userRepo.findById(annotatorId)
                .orElseThrow(() -> new IllegalArgumentException("Annotator not found"));

        // Check if this annotator is assigned to this task
        if (!task.getAnnotators().contains(annotator)) {
            throw new IllegalArgumentException("Annotator not assigned to this task");
        }

        // Add the annotation
        task.addAnnotation(annotation);

        // Mark as completed for this annotator
        task.setAnnotatorCompletionStatus(annotator, true);

        task = taskRepo.save(task);

        // Create and return DTO
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setDatasetId(task.getDataset().getId());
        dto.setText1(task.getText1());
        dto.setText2(task.getText2());

        // Get all annotator IDs
        List<Long> annotatorIds = task.getAnnotators().stream()
                .map(User::getId)
                .collect(Collectors.toList());
        dto.setAnnotatorIds(annotatorIds);

        // Get all annotations
        dto.setAnnotations(task.getAnnotations());

        // Get completion status for all annotators
        Map<Long, Boolean> completionStatus = new HashMap<>();
        task.getCompletionStatus().forEach((user, status) -> completionStatus.put(user.getId(), status));
        dto.setCompletionStatus(completionStatus);

        return dto;
    }

    @Transactional(readOnly = true)
    public TaskDto getTask(Long taskId) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setDatasetId(task.getDataset().getId());
        dto.setText1(task.getText1());
        dto.setText2(task.getText2());

        // Get all annotator IDs
        List<Long> annotatorIds = task.getAnnotators().stream()
                .map(User::getId)
                .collect(Collectors.toList());
        dto.setAnnotatorIds(annotatorIds);

        // Get all annotations
        dto.setAnnotations(task.getAnnotations());

        // Get completion status for all annotators
        Map<Long, Boolean> completionStatus = new HashMap<>();
        task.getCompletionStatus().forEach((user, status) -> completionStatus.put(user.getId(), status));
        dto.setCompletionStatus(completionStatus);

        return dto;
    }

    /**
     * Find tasks with fewer than 3 annotators
     */
    @Transactional(readOnly = true)
    public List<TaskDto> getTasksWithFewerThanThreeAnnotators() {
        List<Task> tasks = taskRepo.findTasksWithFewerThanThreeAnnotators();

        return tasks.stream().map(task -> {
            TaskDto dto = new TaskDto();
            dto.setId(task.getId());
            dto.setDatasetId(task.getDataset().getId());
            dto.setText1(task.getText1());
            dto.setText2(task.getText2());

            // Get all annotator IDs
            List<Long> annotatorIds = task.getAnnotators().stream()
                    .map(User::getId)
                    .collect(Collectors.toList());
            dto.setAnnotatorIds(annotatorIds);

            // Get all annotations
            dto.setAnnotations(task.getAnnotations());

            // Get completion status for all annotators
            Map<Long, Boolean> completionStatus = new HashMap<>();
            task.getCompletionStatus().forEach((user, status) -> completionStatus.put(user.getId(), status));
            dto.setCompletionStatus(completionStatus);

            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Assign a task to an annotator
     */
    @Transactional
    public TaskDto assignTaskToAnnotator(Long taskId, Long annotatorId) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        User annotator = userRepo.findById(annotatorId)
                .orElseThrow(() -> new IllegalArgumentException("Annotator not found"));

        // Add the annotator to the task
        task.addAnnotator(annotator);
        task = taskRepo.save(task);

        return getTask(taskId);
    }

    public Long getTaskCount() {
        return taskRepo.count();
    }
}
