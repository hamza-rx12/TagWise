package com.nli.tagwise.controllers;

import com.nli.tagwise.dto.DatasetDto;
import com.nli.tagwise.dto.DatasetListDto;
import com.nli.tagwise.dto.DatasetDetailsDto;
import com.nli.tagwise.dto.DatasetAnnotatorDto;
import com.nli.tagwise.models.Dataset;
import com.nli.tagwise.models.Task;
import com.nli.tagwise.models.User;
// import com.nli.tagwise.repository.ITaskRepo;
import com.nli.tagwise.services.DatasetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/datasets")
public class DatasetController {

    private final DatasetService datasetService;
    // private final ITaskRepo taskRepo;

    public DatasetController(DatasetService datasetService) {
        this.datasetService = datasetService;
        // this.taskRepo = taskRepo;
    }

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

    @PostMapping("/{datasetId}/assign-users")
    public ResponseEntity<?> assignUsersToDataset(
            @PathVariable Long datasetId,
            @RequestBody List<Long> userIds) {
        try {
            DatasetDto response = datasetService.assignAnnotatorsToDataset(datasetId, userIds);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<DatasetListDto>> listDatasetDtos() {
        return ResponseEntity.ok(datasetService.listDatasetDtos());
    }

    @GetMapping("/{datasetId}/details")
    public ResponseEntity<DatasetDetailsDto> getDatasetFullDetails(@PathVariable Long datasetId) {
        return ResponseEntity.ok(datasetService.getDatasetFullDetails(datasetId));
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
    public ResponseEntity<List<DatasetAnnotatorDto>> getDatasetAnnotators(@PathVariable Long id) {
        return ResponseEntity.ok(datasetService.getDatasetAnnotatorsDto(id));
    }

    @GetMapping("/{id}/unassigned-annotators")
    public ResponseEntity<List<User>> getUnassignedAnnotators(@PathVariable Long id) {
        return ResponseEntity.ok(datasetService.getUnassignedAnnotators(id));
    }

    @DeleteMapping("/{datasetId}/annotators")
    public ResponseEntity<DatasetDto> removeAnnotatorsFromDataset(
            @PathVariable Long datasetId,
            @RequestBody List<Long> annotatorIds) {
        return ResponseEntity.ok(datasetService.removeAnnotatorsFromDataset(datasetId, annotatorIds));
    }
}
