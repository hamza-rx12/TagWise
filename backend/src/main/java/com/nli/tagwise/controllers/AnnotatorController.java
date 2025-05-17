package com.nli.tagwise.controllers;

import com.nli.tagwise.dto.AssignAnnotatorDto;
import com.nli.tagwise.dto.SignUpDto;
import com.nli.tagwise.dto.AnnotatorResponseDto;
import com.nli.tagwise.models.User;
import com.nli.tagwise.services.AnnotatorService;
import com.nli.tagwise.services.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/annotators")
public class AnnotatorController {
    private final AnnotatorService annotatorService;
    private final TaskService taskService;

    public AnnotatorController(AnnotatorService annotatorService, TaskService taskService) {
        this.annotatorService = annotatorService;
        this.taskService = taskService;
    }


    @PostMapping("/users/validate/{userId}")
    public ResponseEntity<User> validateUser(@PathVariable Long userId) {
        User validatedUser = annotatorService.validateUser(userId);
        return ResponseEntity.ok(validatedUser);
    }
    @PostMapping("/add")
    public ResponseEntity<AnnotatorResponseDto> addAnnotator(@RequestBody SignUpDto dto) {
        User annotator = annotatorService.addAnnotator(dto);
        AnnotatorResponseDto response = new AnnotatorResponseDto(
                annotator.getId(), annotator.getFirstName(), annotator.getLastName(),
                annotator.getEmail(), annotator.getRole(), annotator.getGender(),
                annotator.isEnabled(), annotator.getSpamScore(), annotator.getQualityMetric()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AnnotatorResponseDto>> listAnnotators() {
        List<AnnotatorResponseDto> response = annotatorService.listAnnotators().stream()
                .map(annotator -> new AnnotatorResponseDto(
                        annotator.getId(), annotator.getFirstName(), annotator.getLastName(),
                        annotator.getEmail(), annotator.getRole(), annotator.getGender(),
                        annotator.isEnabled(), annotator.getSpamScore(), annotator.getQualityMetric()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/assign")
    public ResponseEntity<Void> assignAnnotator(@RequestBody AssignAnnotatorDto dto) {
        taskService.assignAnnotators(dto);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @DeleteMapping("/remove/{datasetId}/{annotatorId}")
    public ResponseEntity<Void> removeAnnotator(@PathVariable Long datasetId, @PathVariable Long annotatorId) {
        taskService.removeAnnotator(datasetId, annotatorId);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @PostMapping("/spam/{annotatorId}")
    public ResponseEntity<Void> detectSpam(@PathVariable Long annotatorId) {
        annotatorService.detectSpam(annotatorId);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @PostMapping("/quality/{annotatorId}")
    public ResponseEntity<Void> calculateQualityMetric(@PathVariable Long annotatorId) {
        annotatorService.calculateQualityMetric(annotatorId);
        return ResponseEntity.status(HttpStatus.OK).build();
    }
}