package com.backend.datadrop.controller;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.backend.datadrop.model.Url;
import com.backend.datadrop.service.UrlService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final AmazonS3 s3client;
    private final UrlService urlService;

    public FileController(AmazonS3 s3client, UrlService urlService) {
        this.s3client = s3client;
        this.urlService = urlService;
    }

    @Value("${amazon.bucket.name}")
    String bucket_name;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return new ResponseEntity<>("No file uploaded", HttpStatus.BAD_REQUEST);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = (originalFilename != null && originalFilename.contains(".")) ?
                originalFilename.substring(originalFilename.lastIndexOf(".") + 1) : "";

        // ✅ Optional: Validate file type against DB entries
        boolean allowed = urlService.getAll().stream()
                .anyMatch(u -> u.getFile_type().equalsIgnoreCase(extension));

        if (!allowed) {
            return new ResponseEntity<>("Invalid file type: " + extension, HttpStatus.BAD_REQUEST);
        }

        try {
            // ✅ Upload file to S3
            File tempFile = File.createTempFile("upload-", originalFilename);
            file.transferTo(tempFile);

            s3client.putObject(bucket_name, originalFilename, tempFile);
            tempFile.delete();
        } catch (Exception e) {
            return new ResponseEntity<>("File upload failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // ✅ Fetch all files from S3
        ListObjectsV2Result result = s3client.listObjectsV2(bucket_name);
        List<String> allFiles = result.getObjectSummaries()
                .stream()
                .map(S3ObjectSummary::getKey)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("uploadedFile", originalFilename);
        response.put("bucket", bucket_name);
        response.put("allFiles", allFiles);
        response.put("message", "File uploaded successfully");

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<?> getProcessedFiles() {
        ListObjectsV2Result result = s3client.listObjectsV2(bucket_name);
        List<S3ObjectSummary> objects = result.getObjectSummaries();

        List<Map<String, Object>> files = objects.stream().map(obj -> {
            Map<String, Object> fileInfo = new HashMap<>();
            fileInfo.put("key", obj.getKey());
            fileInfo.put("size", obj.getSize());
            fileInfo.put("lastModified", obj.getLastModified());
            fileInfo.put("storageClass", obj.getStorageClass());
            return fileInfo;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(files);
    }
}
