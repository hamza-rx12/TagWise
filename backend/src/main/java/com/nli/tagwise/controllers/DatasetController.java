package com.nli.tagwise.controllers;

import com.nli.tagwise.dto.AnnotatorDto;
import com.nli.tagwise.dto.DatasetDetailsDto;
import com.nli.tagwise.dto.DatasetListDto;
import com.nli.tagwise.dto.TextPairDto;
import com.nli.tagwise.models.Dataset;
import com.nli.tagwise.models.DatasetAnnotator;
import com.nli.tagwise.models.Task;
import com.nli.tagwise.repository.ITaskRepo;
import com.nli.tagwise.services.DatasetService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/datasets")
public class DatasetController {

    private final DatasetService datasetService;
    private final ITaskRepo taskRepo;

    public DatasetController(DatasetService datasetService, ITaskRepo taskRepo) {
        this.datasetService = datasetService;
        this.taskRepo = taskRepo; // Initialisez le repository
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Dataset> uploadDataset(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam("classes") String classes,
            @RequestParam(value = "description", required = false) String description) {

        try {
            Dataset dataset = datasetService.createDataset(
                    file,
                    name,
                    classes,
                    description);
            return ResponseEntity.ok(dataset);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

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
                        (int) taskRepo.countByDatasetAndAnnotatorAndCompleted(dataset, da.getAnnotator(), true)))
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