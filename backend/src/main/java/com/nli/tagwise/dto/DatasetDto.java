package com.nli.tagwise.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
// import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DatasetDto {
    private String name;
    private String description;
    private String classes;
    private int taskCount;
    // private MultipartFile file;
    // private String filePath; // Path to uploaded file
    // private boolean isNliDataset; // New field
    // private boolean binaryClassification; // New field

}