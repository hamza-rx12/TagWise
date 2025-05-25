package com.nli.tagwise.services;

import com.nli.tagwise.models.Dataset;
import com.nli.tagwise.models.DatasetAnnotator;
import com.nli.tagwise.models.Task;
import com.nli.tagwise.repository.IDatasetAnnotatorRepo;
import com.nli.tagwise.repository.IDatasetRepo;
import com.nli.tagwise.repository.ITaskRepo;
import java.nio.file.Path;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DatasetService {
    private final IDatasetRepo datasetRepo;
    private final ITaskRepo taskRepo;
    private final IDatasetAnnotatorRepo datasetAnnotatorRepo;
    private final String UPLOAD_DIR = "uploads/datasets";

    public DatasetService(IDatasetRepo datasetRepo, ITaskRepo taskRepo, IDatasetAnnotatorRepo datasetAnnotatorRepo) {
        this.datasetRepo = datasetRepo;
        this.taskRepo = taskRepo;
        this.datasetAnnotatorRepo = datasetAnnotatorRepo;
    }

    /*
     * public Dataset createDataset(DatasetDto dto) {
     * Dataset dataset = new Dataset();
     * dataset.setName(dto.getName());
     * dataset.setDescription(dto.getDescription());
     * dataset.setClasses(dto.getClasses());
     * dataset.setFilePath(dto.getFilePath());
     * return datasetRepo.save(dataset);
     * }
     */

    public Dataset createDataset(MultipartFile file, String name,
            String classes, String description) throws IOException {
        // 1. Save raw file
        String filePath = saveFile(file);

        // 2. Create dataset record
        Dataset dataset = new Dataset();
        dataset.setName(name);
        dataset.setClasses(classes);
        dataset.setDescription(description);
        dataset.setFilePath(filePath);

        return datasetRepo.save(dataset);
    }

    private String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        return filePath.toString();
    }

    public List<Dataset> listDatasets() {
        return datasetRepo.findAll();
    }

    public Dataset getDatasetDetails(Long id) {
        return datasetRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Dataset not found"));
    }

    public List<Task> getDatasetTasks(Long datasetId) {
        // Dataset dataset = getDatasetDetails(datasetId);
        return taskRepo.findAll().stream()
                .filter(task -> task.getDataset().getId().equals(datasetId))
                .collect(Collectors.toList());
    }

    public List<DatasetAnnotator> getDatasetAnnotators(Long datasetId) {
        Dataset dataset = getDatasetDetails(datasetId);
        return datasetAnnotatorRepo.findByDataset(dataset);
    }
}