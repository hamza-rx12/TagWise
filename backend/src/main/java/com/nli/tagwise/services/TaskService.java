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

import java.util.*;
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
        User newAnnotator = userRepo.findById(dto.getAnnotatorId())
                .orElseThrow(() -> new IllegalArgumentException("Annotator not found"));

        // Crée ou met à jour le lien DatasetAnnotator
        DatasetAnnotator datasetAnnotator = new DatasetAnnotator();
        datasetAnnotator.setDataset(dataset);
        datasetAnnotator.setAnnotator(newAnnotator);
        datasetAnnotatorRepo.save(datasetAnnotator);

        // Récupère tous les annotateurs déjà assignés à ce dataset
        List<DatasetAnnotator> datasetAnnotators = datasetAnnotatorRepo.findByDataset(dataset);
        List<User> annotators = datasetAnnotators.stream()
                .map(DatasetAnnotator::getAnnotator)
                .collect(Collectors.toList());

        // Récupère les tâches existantes pour ce dataset
        List<Task> existingTasks = taskRepo.findByDataset(dataset);

        // Si aucune tâche, rien à répartir (elles sont créées lors de l'import du dataset)
        if (!existingTasks.isEmpty()) {
            divideTasksAmongAnnotators(existingTasks, annotators);
            taskRepo.saveAll(existingTasks);
        }
    }

    private void divideTasksAmongAnnotators(List<Task> tasks, List<User> annotators) {
        if (annotators.isEmpty() || tasks.isEmpty()) return;

        // Réinitialise les assignations
        for (Task task : tasks) {
            task.getAnnotators().clear();
            task.getCompletionStatus().clear();
        }

        int numAnnotators = annotators.size();
        int tasksPerAnnotator = tasks.size() / numAnnotators;
        int extraTasks = tasks.size() % numAnnotators;

        int taskIndex = 0;
        for (int i = 0; i < numAnnotators; i++) {
            User annotator = annotators.get(i);
            int tasksForThisAnnotator = tasksPerAnnotator + (extraTasks > 0 ? 1 : 0);
            if (extraTasks > 0) extraTasks--;

            for (int j = 0; j < tasksForThisAnnotator && taskIndex < tasks.size(); j++) {
                Task task = tasks.get(taskIndex++);
                task.addAnnotator(annotator);
            }
        }
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

        // Retire l'annotateur des tâches mais conserve les tâches
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
            dto.setAnnotations(task.getAnnotations() != null ? task.getAnnotations() : new ArrayList<>());

            // Completion status
            Map<Long, Boolean> status = new HashMap<>();
            Boolean completed = task.getCompletionStatus() != null
                    ? task.getCompletionStatus().get(annotator)
                    : false;
            status.put(annotatorId, completed != null ? completed : false);
            dto.setCompletionStatus(status);

            // Metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("datasetName", task.getDataset().getName());
            metadata.put("isNewAssignment", completed == null);
            dto.setMetadata(metadata);

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

            List<Long> annotatorIds = task.getAnnotators().stream()
                    .map(User::getId)
                    .collect(Collectors.toList());
            dto.setAnnotatorIds(annotatorIds);

            dto.setAnnotations(task.getAnnotations());

            Map<Long, Boolean> completionStatus = new HashMap<>();
            task.getCompletionStatus().forEach((user, status) ->
                    completionStatus.put(user.getId(), status));
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

        if (!task.getAnnotators().contains(annotator)) {
            throw new IllegalArgumentException("Annotator not assigned to this task");
        }

        task.addAnnotation(annotation);
        task.setAnnotatorCompletionStatus(annotator, true);

        task = taskRepo.save(task);

        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setDatasetId(task.getDataset().getId());
        dto.setText1(task.getText1());
        dto.setText2(task.getText2());

        List<Long> annotatorIds = task.getAnnotators().stream()
                .map(User::getId)
                .collect(Collectors.toList());
        dto.setAnnotatorIds(annotatorIds);

        dto.setAnnotations(task.getAnnotations());

        Map<Long, Boolean> completionStatus = new HashMap<>();
        task.getCompletionStatus().forEach((user, status) ->
                completionStatus.put(user.getId(), status));
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

        List<Long> annotatorIds = task.getAnnotators().stream()
                .map(User::getId)
                .collect(Collectors.toList());
        dto.setAnnotatorIds(annotatorIds);

        dto.setAnnotations(task.getAnnotations());

        Map<Long, Boolean> completionStatus = new HashMap<>();
        task.getCompletionStatus().forEach((user, status) ->
                completionStatus.put(user.getId(), status));
        dto.setCompletionStatus(completionStatus);

        return dto;
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getTasksWithFewerThanThreeAnnotators() {
        List<Task> tasks = taskRepo.findTasksWithFewerThanThreeAnnotators();

        return tasks.stream().map(task -> {
            TaskDto dto = new TaskDto();
            dto.setId(task.getId());
            dto.setDatasetId(task.getDataset().getId());
            dto.setText1(task.getText1());
            dto.setText2(task.getText2());

            List<Long> annotatorIds = task.getAnnotators().stream()
                    .map(User::getId)
                    .collect(Collectors.toList());
            dto.setAnnotatorIds(annotatorIds);

            dto.setAnnotations(task.getAnnotations());

            Map<Long, Boolean> completionStatus = new HashMap<>();
            task.getCompletionStatus().forEach((user, status) ->
                    completionStatus.put(user.getId(), status));
            dto.setCompletionStatus(completionStatus);

            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public TaskDto assignTaskToAnnotator(Long taskId, Long annotatorId) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        User annotator = userRepo.findById(annotatorId)
                .orElseThrow(() -> new IllegalArgumentException("Annotator not found"));

        task.addAnnotator(annotator);
        task = taskRepo.save(task);

        return getTask(taskId);
    }

    public Long getTaskCount() {
        return taskRepo.count();
    }

    public Long getCompletedTaskCount() {
        List<Task> allTasks = taskRepo.findAll();
        return allTasks.stream()
                .filter(Task::isCompleted)
                .count();
    }
}