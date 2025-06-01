package com.nli.tagwise.controllers;

import com.nli.tagwise.dto.AnnotatorDto;
import com.nli.tagwise.dto.DatasetDetailsDto;
import com.nli.tagwise.dto.DatasetListDto;
import com.nli.tagwise.dto.TextPairDto;
import com.nli.tagwise.models.Dataset;
import com.nli.tagwise.models.DatasetAnnotator;
import com.nli.tagwise.models.Task;
import com.nli.tagwise.repository.IDatasetRepo;
import com.nli.tagwise.repository.ITaskRepo;
import com.nli.tagwise.services.DatasetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/datasets")
public class DatasetController {

    private final DatasetService datasetService;
    private final ITaskRepo taskRepo;
    private final IDatasetRepo datasetRepo;

    public DatasetController(DatasetService datasetService, ITaskRepo taskRepo, IDatasetRepo datasetRepo) {
        this.datasetService = datasetService;
        this.taskRepo = taskRepo; // Initialisez le repository
        this.datasetRepo = datasetRepo;
    }

    /**
     * Uploads a dataset from a CSV file.
     * Only CSV files are accepted. Other file types will result in a 400 Bad Request response.
     */
    @PostMapping("/upload")
    public ResponseEntity<Dataset> uploadDataset(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam("classes") String classes,
            @RequestParam(value = "description", required = false) String description) {

        if (file.isEmpty() || !file.getOriginalFilename().endsWith(".csv")) {
            return ResponseEntity.badRequest().body(null);
        }

        try {
            Dataset savedDataset = datasetService.saveDatasetFromCsv(file, name, classes, description);
            return ResponseEntity.ok(savedDataset);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
//    @PostMapping("/upload")
//    public ResponseEntity<Dataset> uploadDataset(
//            @RequestParam("file") MultipartFile file,
//            @RequestParam("name") String name,
//            @RequestParam("classes") String classes,
//            @RequestParam(value = "description", required = false) String description) {
//
//        if (file.isEmpty() || !file.getOriginalFilename().endsWith(".csv")) {
//            return ResponseEntity.badRequest().body(null);
//        }
//
//        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
//            // Create and persist Dataset
//            Dataset dataset = new Dataset();
//            dataset.setName(name);
//            dataset.setDescription(description);
//            dataset.setClasses(classes);
//            dataset.setFilePath("inline"); // No physical file
//            dataset.setTasks(new ArrayList<>());
//
//            Dataset savedDataset = datasetRepo.save(dataset); // Save first for FK binding
//
//            // Parse CSV and create tasks
//            String line;
//            int lineNumber = 0;
//            List<Task> tasks = new ArrayList<>();
//
//            while ((line = reader.readLine()) != null) {
//                lineNumber++;
//                String[] columns = line.split("\t", -1); // allow empty columns
//
//                if (columns.length < 2) {
//                    // skip or log malformed line
//                    continue;
//                }
//
//                Task task = new Task();
//                task.setDataset(savedDataset);
//                task.setText1(columns[0].trim());
//                task.setText2(columns[1].trim());
//                task.setAnnotations(new ArrayList<>());
//                task.setAnnotators(new ArrayList<>());
//                task.setCompletionStatus(new HashMap<>());
//
//                tasks.add(task);
//            }
//
//            taskRepo.saveAll(tasks);
//            return ResponseEntity.ok(savedDataset);
//
//        } catch (IOException e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
//        }
//    }


    @PostMapping("/{datasetId}/assign-users")
    public ResponseEntity<?> assignUsersToDataset(
            @PathVariable Long datasetId,
            @RequestBody List<Long> userIds) {
        try {
            Dataset updatedDataset = datasetService.assignAnnotatorsToDataset(datasetId, userIds);
            return ResponseEntity.ok(updatedDataset);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


//    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<Dataset> uploadDataset(
//            @RequestParam("file") MultipartFile file,
//            @RequestParam("name") String name,
//            @RequestParam("classes") String classes,
//            @RequestParam(value = "description", required = false) String description) {
//
//        try {
//            // Validate that the file is a CSV file
//            String originalFilename = file.getOriginalFilename();
//            if (originalFilename != null && !originalFilename.toLowerCase().endsWith(".csv")) {
//                return ResponseEntity.badRequest().build();
//            }
//
//            Dataset dataset = datasetService.createDataset(
//                    file,
//                    name,
//                    classes,
//                    description);
//            return ResponseEntity.ok(dataset);
//        } catch (IOException e) {
//            return ResponseEntity.internalServerError().build();
//        }
//    }

    // DatasetController.java
    @GetMapping("/list")
    public ResponseEntity<List<DatasetListDto>> listDatasetDtos() {
        List<Dataset> datasets = datasetService.listDatasets();

        List<DatasetListDto> response = datasets.stream()
                .map(dataset -> new DatasetListDto(
                        dataset.getId(),
                        dataset.getName(),
                        dataset.getCompletionPercentage(),
                        dataset.getClasses(),
                        dataset.getDescription()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // DatasetController.java
    @GetMapping("/{datasetId}/details")
    public ResponseEntity<DatasetDetailsDto> getDatasetFullDetails(@PathVariable Long datasetId) {
        Dataset dataset = datasetService.getDatasetDetails(datasetId);

        DatasetDetailsDto response = new DatasetDetailsDto();
        response.setId(dataset.getId());
        response.setName(dataset.getName());
        response.setDescription(dataset.getDescription());
        response.setClasses(dataset.getClasses());
        response.setCompletionPercentage(dataset.getCompletionPercentage());
        response.setTotalPairs(dataset.getTasks().size());

        // Get sample pairs
        response.setSamplePairs(dataset.getTasks().stream()
                .limit(5)
                .map(task -> new TextPairDto(task.getId(), task.getText1(), task.getText2()))
                .collect(Collectors.toList()));

        // Get assigned annotators
        // Object ITaskRepo;
        response.setAssignedAnnotators(dataset.getAnnotators().stream()
                .map(da -> new AnnotatorDto(
                        da.getAnnotator().getId(),
                        da.getAnnotator().getFirstName() + " " + da.getAnnotator().getLastName(),
                        (int) taskRepo.countCompletedTasksByDatasetAndAnnotator(dataset, da.getAnnotator())))
                .collect(Collectors.toList()));

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Dataset>> listAllDatasets() {
        return ResponseEntity.ok(datasetService.listDatasets());
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<Dataset> getDatasetSummary(@PathVariable Long id) {
        return ResponseEntity.ok(datasetService.getDatasetDetails(id));
    }

    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<Task>> getDatasetTasks(@PathVariable Long id) {
        return ResponseEntity.ok(datasetService.getDatasetTasks(id));
    }

    @GetMapping("/{id}/annotators")
    public ResponseEntity<List<DatasetAnnotator>> getDatasetAnnotators(@PathVariable Long id) {
        return ResponseEntity.ok(datasetService.getDatasetAnnotators(id));
    }

}
