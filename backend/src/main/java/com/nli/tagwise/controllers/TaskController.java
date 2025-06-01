package com.nli.tagwise.controllers;

import com.nli.tagwise.dto.TaskDto;
import com.nli.tagwise.services.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Get count of tasks
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getTaskCount() {
        return ResponseEntity.ok(taskService.getTaskCount());
    }

    /**
     * Get count of completed tasks
     */
    @GetMapping("/completed/count")
    public ResponseEntity<Long> getCompletedTaskCount() {
        return ResponseEntity.ok(taskService.getCompletedTaskCount());
    }

    /**
     * Get a task by its id
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTask(id));
    }

    /**
     * Get all tasks for a dataset (admin only)
     */
    @GetMapping("/dataset/{datasetId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<TaskDto>> getTasksForDataset(@PathVariable Long datasetId) {
        return ResponseEntity.ok(taskService.getTasksForDataset(datasetId));
    }

    /**
     * Get all tasks for the current annotator
     */
    @GetMapping("/annotator/{annotatorId}")
    public ResponseEntity<List<TaskDto>> getTasksForAnnotator(@PathVariable Long annotatorId) {
        return ResponseEntity.ok(taskService.getTasksForAnnotator(annotatorId));
    }

    /**
     * Submit an annotation for a task
     */
    @PostMapping("/{taskId}/annotate")
    public ResponseEntity<TaskDto> submitAnnotation(
            @PathVariable Long taskId,
            @RequestParam Long annotatorId,
            @RequestParam String annotation) {
        return ResponseEntity.ok(taskService.submitAnnotation(taskId, annotatorId, annotation));
    }

    /**
     * Find tasks with fewer than 3 annotators (admin only)
     */
    @GetMapping("/incomplete-assignments")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<TaskDto>> getTasksWithFewerThanThreeAnnotators() {
        return ResponseEntity.ok(taskService.getTasksWithFewerThanThreeAnnotators());
    }

    /**
     * Assign a task to an annotator (admin only)
     */
    @PostMapping("/{taskId}/assign")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<TaskDto> assignTaskToAnnotator(
            @PathVariable Long taskId,
            @RequestParam Long annotatorId) {
        return ResponseEntity.ok(taskService.assignTaskToAnnotator(taskId, annotatorId));
    }
}
