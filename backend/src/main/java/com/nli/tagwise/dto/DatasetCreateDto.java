package com.nli.tagwise.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DatasetCreateDto {
    private String name;
    private MultipartFile file;
    private String classes; // Semicolon-separated
    private String description;
}