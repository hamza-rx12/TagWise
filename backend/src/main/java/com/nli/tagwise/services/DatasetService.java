package com.nli.tagwise.services;

import com.nli.tagwise.dto.AnnotatorDto;
import com.nli.tagwise.dto.DatasetDetailsDto;
import com.nli.tagwise.dto.DatasetDto;
import com.nli.tagwise.dto.DatasetListDto;
import com.nli.tagwise.dto.TextPairDto;
import com.nli.tagwise.dto.DatasetAnnotatorDto;
import com.nli.tagwise.models.Dataset;
import com.nli.tagwise.models.DatasetAnnotator;
import com.nli.tagwise.models.Role;
import com.nli.tagwise.models.Task;
import com.nli.tagwise.models.User;
import com.nli.tagwise.repository.IDatasetAnnotatorRepo;
import com.nli.tagwise.repository.IDatasetRepo;
import com.nli.tagwise.repository.ITaskRepo;
import com.nli.tagwise.repository.IUserRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DatasetService {
    private final IDatasetRepo datasetRepo;
    private final ITaskRepo taskRepo;
    private final IDatasetAnnotatorRepo datasetAnnotatorRepo;
    private final IUserRepo userRepo;

    public DatasetService(IDatasetRepo datasetRepo, ITaskRepo taskRepo, IDatasetAnnotatorRepo datasetAnnotatorRepo, IUserRepo userRepo) {
        this.datasetRepo = datasetRepo;
        this.taskRepo = taskRepo;
        this.datasetAnnotatorRepo = datasetAnnotatorRepo;
        this.userRepo = userRepo;
    }

    public Dataset saveDatasetFromCsv(MultipartFile file, String name, String classes, String description) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            Dataset dataset = new Dataset();
            dataset.setName(name);
            dataset.setDescription(description);
            dataset.setClasses(classes);
            dataset.setFilePath("inline");
            dataset.setTasks(new ArrayList<>());

            Dataset savedDataset = datasetRepo.save(dataset);

            List<Task> tasks = new ArrayList<>();
            String line;
            while ((line = reader.readLine()) != null) {
                String[] columns = line.split("\t", -1);
                if (columns.length < 2) continue;

                Task task = new Task();
                task.setDataset(savedDataset);
                task.setText1(columns[0].trim());
                task.setText2(columns[1].trim());
                task.setAnnotations(new ArrayList<>());
                task.setAnnotators(new ArrayList<>());
                task.setCompletionStatus(new HashMap<>());
                tasks.add(task);
            }
            taskRepo.saveAll(tasks);
            return savedDataset;
        }
    }

    @Transactional
    public DatasetDto assignAnnotatorsToDataset(Long datasetId, List<Long> userIds) {
        Dataset dataset = getDatasetDetails(datasetId);
        List<User> users = userRepo.findAllById(userIds);

        if (users.size() != userIds.size()) {
            throw new IllegalArgumentException("One or more users not found");
        }

        // Clear existing assignments for this dataset
        datasetAnnotatorRepo.deleteByDataset(dataset);

        // Create new assignments
        List<DatasetAnnotator> links = users.stream().map(user -> {
            DatasetAnnotator da = new DatasetAnnotator();
            da.setAnnotator(user);
            da.setDataset(dataset);
            return da;
        }).collect(Collectors.toList());
        datasetAnnotatorRepo.saveAll(links);

        // Get all tasks for this dataset
        List<Task> tasks = taskRepo.findByDataset(dataset);

        // Divide tasks among annotators
        divideTasksAmongAnnotators(tasks, users);
        taskRepo.saveAll(tasks);

        // Map to DTO
        DatasetDto response = new DatasetDto();
        response.setName(dataset.getName());
        response.setDescription(dataset.getDescription());
        response.setClasses(dataset.getClasses());
        return response;
    }

    private void divideTasksAmongAnnotators(List<Task> tasks, List<User> annotators) {
        if (annotators.isEmpty() || tasks.isEmpty()) return;

        // Clear existing assignments
        tasks.forEach(task -> {
            task.getAnnotators().clear();
            task.getCompletionStatus().clear();
        });

        int tasksPerAnnotator = tasks.size() / annotators.size();
        int extraTasks = tasks.size() % annotators.size();

        int taskIndex = 0;
        for (int i = 0; i < annotators.size(); i++) {
            User annotator = annotators.get(i);
            int tasksToAssign = tasksPerAnnotator + (i < extraTasks ? 1 : 0);

            for (int j = 0; j < tasksToAssign && taskIndex < tasks.size(); j++) {
                Task task = tasks.get(taskIndex++);
                task.addAnnotator(annotator);
            }
        }
    }

    public List<Dataset> listDatasets() {
        return datasetRepo.findAll();
    }

    public Dataset getDatasetDetails(Long id) {
        return datasetRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Dataset not found"));
    }

    public List<Task> getDatasetTasks(Long datasetId) {
        return taskRepo.findAll().stream()
                .filter(task -> task.getDataset().getId().equals(datasetId))
                .collect(Collectors.toList());
    }

    public List<DatasetAnnotator> getDatasetAnnotators(Long datasetId) {
        Dataset dataset = getDatasetDetails(datasetId);
        return datasetAnnotatorRepo.findByDataset(dataset);
    }

    public List<User> getUnassignedAnnotators(Long datasetId) {
        Dataset dataset = getDatasetDetails(datasetId);
        List<User> allAnnotators = userRepo.findByRoleAndDeletedFalse(Role.ROLE_USER);
        List<DatasetAnnotator> assignedLinks = datasetAnnotatorRepo.findByDataset(dataset);
        List<Long> assignedAnnotatorIds = assignedLinks.stream()
                .map(link -> link.getAnnotator().getId())
                .collect(Collectors.toList());
        return allAnnotators.stream()
                .filter(annotator -> !assignedAnnotatorIds.contains(annotator.getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public DatasetDto removeAnnotatorsFromDataset(Long datasetId, List<Long> annotatorIds) {
        Dataset dataset = getDatasetDetails(datasetId);

        for (Long annotatorId : annotatorIds) {
            User annotator = userRepo.findById(annotatorId)
                    .orElseThrow(() -> new IllegalArgumentException("Annotator not found: " + annotatorId));
            try {
                datasetAnnotatorRepo.deleteByDatasetAndAnnotator(dataset, annotator);
            } catch (Exception e) {
                throw new IllegalArgumentException("Annotator is not assigned to this dataset: " + annotatorId);
            }
        }

        return new DatasetDto(dataset.getName(), dataset.getDescription(), dataset.getClasses(),
                dataset.getTasks().size());
    }

    public List<DatasetListDto> listDatasetDtos() {
        List<Dataset> datasets = listDatasets();
        return datasets.stream()
                .map(dataset -> new DatasetListDto(
                        dataset.getId(),
                        dataset.getName(),
                        dataset.getCompletionPercentage(),
                        dataset.getClasses(),
                        dataset.getDescription()))
                .collect(Collectors.toList());
    }

    public DatasetDetailsDto getDatasetFullDetails(Long datasetId) {
        Dataset dataset = getDatasetDetails(datasetId);

        DatasetDetailsDto response = new DatasetDetailsDto();
        response.setId(dataset.getId());
        response.setName(dataset.getName());
        response.setDescription(dataset.getDescription());
        response.setClasses(dataset.getClasses());
        response.setCompletionPercentage(dataset.getCompletionPercentage());
        response.setTotalPairs(dataset.getTasks().size());

        response.setSamplePairs(dataset.getTasks().stream()
                .limit(5)
                .map(task -> new TextPairDto(task.getId(), task.getText1(), task.getText2()))
                .collect(Collectors.toList()));

        response.setAssignedAnnotators(dataset.getAnnotators().stream()
                .map(da -> new AnnotatorDto(
                        da.getAnnotator().getId(),
                        da.getAnnotator().getFirstName() + " " + da.getAnnotator().getLastName(),
                        da.getAnnotator().getEmail(),
                        taskRepo.countCompletedTasksByDatasetAndAnnotator(dataset, da.getAnnotator())))
                .collect(Collectors.toList()));

        return response;
    }

    public List<DatasetAnnotatorDto> getDatasetAnnotatorsDto(Long datasetId) {
        List<DatasetAnnotator> datasetAnnotators = getDatasetAnnotators(datasetId);
        return datasetAnnotators.stream()
                .map(da -> new DatasetAnnotatorDto(
                        da.getAnnotator().getId(),
                        da.getAnnotator().getId(),
                        da.getAnnotator().getFirstName(),
                        da.getAnnotator().getLastName(),
                        da.getAnnotator().getEmail(),
                        da.getAnnotator().getRole().toString(),
                        da.getAnnotator().isEnabled()))
                .collect(Collectors.toList());
    }

    public Long getDatasetCount() {
        return datasetRepo.count();
    }

    public List<Dataset> getRecentDatasets(int limit) {
        return datasetRepo.findAll().stream()
                .sorted((d1, d2) -> d2.getId().compareTo(d1.getId()))
                .limit(limit)
                .collect(Collectors.toList());
    }
}