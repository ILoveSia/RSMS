package org.itcen.domain.common.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.common.dto.AttachmentDto;
import org.itcen.domain.common.service.AttachmentService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

/**
 * 첨부파일 컨트롤러
 * 
 * 첨부파일 관련 REST API 엔드포인트를 제공하는 컨트롤러입니다.
 * 클라이언트의 요청을 받아 서비스 계층에 위임하고, 결과를 응답으로 반환합니다.
 * 
 * 설계 원칙:
 * - Single Responsibility: HTTP 요청/응답 처리만 담당
 * - Open/Closed: 새로운 엔드포인트 추가에 열려있음
 * - Dependency Inversion: 서비스 인터페이스에 의존하여 결합도 감소
 */
@Slf4j
@RestController
@RequestMapping("/common/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    /**
     * 파일 업로드 (여러 파일)
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<List<AttachmentDto.UploadResult>>> uploadFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") Long entityId,
            @RequestParam("uploadedBy") String uploadedBy) {
        
        try {
            AttachmentDto.UploadRequest uploadRequest = AttachmentDto.UploadRequest.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .uploadedBy(uploadedBy)
                    .build();

            List<AttachmentDto.UploadResult> results = attachmentService
                    .uploadFiles(Arrays.asList(files), uploadRequest);

            return ResponseEntity.ok(
                ApiResponse.success("파일 업로드가 완료되었습니다.", results)
            );

        } catch (IOException e) {
            log.error("파일 업로드 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("파일 업로드에 실패했습니다."));
        }
    }

    /**
     * 단일 파일 업로드
     */
    @PostMapping("/upload/single")
    public ResponseEntity<ApiResponse<AttachmentDto.UploadResult>> uploadSingleFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") Long entityId,
            @RequestParam("uploadedBy") String uploadedBy) {
        
        try {
            AttachmentDto.UploadRequest uploadRequest = AttachmentDto.UploadRequest.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .uploadedBy(uploadedBy)
                    .build();

            AttachmentDto.UploadResult result = attachmentService.uploadFile(file, uploadRequest);

            return ResponseEntity.ok(
                ApiResponse.success("파일 업로드가 완료되었습니다.", result)
            );

        } catch (IOException e) {
            log.error("단일 파일 업로드 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("파일 업로드에 실패했습니다."));
        }
    }


    @PostMapping("/write/single")
    public ResponseEntity<ApiResponse<AttachmentDto.UploadResult>> writeSingleFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") Long entityId,
            @RequestParam("uploadedBy") String uploadedBy) {
                
        
        try {            
            AttachmentDto.UploadRequest uploadRequest = AttachmentDto.UploadRequest.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .uploadedBy(uploadedBy)
                    .build();

            List<AttachmentDto.Response> existingAttachments = attachmentService
                    .getAttachmentsByEntity(entityType, entityId);
            
            AttachmentDto.UploadResult result;
            if (!existingAttachments.isEmpty()) {
                AttachmentDto.Response existing = existingAttachments.get(0);
                result = attachmentService.updateFile(file, existing.getAttachId(), uploadRequest);
            } else {
                result = attachmentService.uploadFile(file, uploadRequest);
            }

            return ResponseEntity.ok(
                ApiResponse.success("파일 업로드가 완료되었습니다.", result)
            );

        } catch (IOException e) {
            log.error("단일 파일 업로드 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("파일 업로드에 실패했습니다."));
        } catch (Exception e) {
            log.error("writeSingleFile 처리 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("파일 처리 중 오류가 발생했습니다."));
        }
    }
    /**
     * 엔티티의 첨부파일 목록 조회 (쿼리 파라미터 방식)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AttachmentDto.Response>>> getAttachments(
            @RequestParam String entityType,
            @RequestParam Long entityId) {
        
        try {
            List<AttachmentDto.Response> attachments = attachmentService
                    .getAttachmentsByEntity(entityType, entityId);
            
            return ResponseEntity.ok(
                ApiResponse.success("첨부파일 목록 조회가 완료되었습니다.", attachments)
            );
        } catch (Exception e) {
            log.error("첨부파일 목록 조회 중 오류 발생 - entityType: {}, entityId: {}", entityType, entityId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("첨부파일 목록 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 엔티티의 첨부파일 목록 조회 (패스 파라미터 방식)
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<AttachmentDto.Response>>> getAttachmentsByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        
        List<AttachmentDto.Response> attachments = attachmentService
                .getAttachmentsByEntity(entityType, entityId);

        return ResponseEntity.ok(
            ApiResponse.success("첨부파일 목록 조회가 완료되었습니다.", attachments)
        );
    }

    /**
     * 첨부파일 상세 조회
     */
    @GetMapping("/{attachId}")
    public ResponseEntity<ApiResponse<AttachmentDto.Response>> getAttachmentById(
            @PathVariable Long attachId) {
        
        AttachmentDto.Response attachment = attachmentService.getAttachmentById(attachId);

        return ResponseEntity.ok(
            ApiResponse.success("첨부파일 조회가 완료되었습니다.", attachment)
        );
    }

    /**
     * 첨부파일 다운로드
     */
    @GetMapping("/{attachId}/download")
    public ResponseEntity<InputStreamResource> downloadFile(@PathVariable Long attachId) {
        
        try {
            AttachmentDto.DownloadInfo downloadInfo = attachmentService.getDownloadInfo(attachId);

            FileInputStream fileInputStream = new FileInputStream(downloadInfo.getFilePath());
            InputStreamResource resource = new InputStreamResource(fileInputStream);

            // 한글 파일명 인코딩 처리
            String encodedFilename = java.net.URLEncoder.encode(downloadInfo.getOriginalFilename(), "UTF-8")
                    .replaceAll("\\+", "%20");
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + downloadInfo.getOriginalFilename() + "\"; " +
                            "filename*=UTF-8''" + encodedFilename)
                    .contentType(MediaType.parseMediaType(downloadInfo.getContentType()))
                    .contentLength(downloadInfo.getFileSize())
                    .body(resource);

        } catch (Exception e) {
            log.error("첨부파일 다운로드 중 오류 발생: {}", attachId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 첨부파일 삭제
     */
    @DeleteMapping("/{attachId}")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(
            @PathVariable Long attachId,
            @RequestParam("deletedBy") String deletedBy) {
        
        attachmentService.deleteAttachment(attachId, deletedBy);

        return ResponseEntity.ok(
            ApiResponse.success("첨부파일이 삭제되었습니다.")
        );
    }

    /**
     * 첨부파일 일괄 삭제
     */
    @DeleteMapping("/bulk")
    public ResponseEntity<ApiResponse<Void>> deleteAttachments(
            @Valid @RequestBody AttachmentDto.BulkDeleteRequest deleteRequest) {
        
        attachmentService.deleteAttachments(deleteRequest.getAttachIds(), deleteRequest.getDeletedBy());

        return ResponseEntity.ok(
            ApiResponse.success("첨부파일들이 삭제되었습니다.")
        );
    }

    /**
     * 엔티티의 모든 첨부파일 삭제
     */
    @DeleteMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<Void>> deleteAllAttachmentsByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @RequestParam("deletedBy") String deletedBy) {
        
        attachmentService.deleteAllAttachmentsByEntity(entityType, entityId, deletedBy);

        return ResponseEntity.ok(
            ApiResponse.success("엔티티의 모든 첨부파일이 삭제되었습니다.")
        );
    }



    /**
     * 엔티티의 첨부파일 개수 조회
     */
    @GetMapping("/count/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<Long>> getAttachmentCount(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        
        long count = attachmentService.getAttachmentCount(entityType, entityId);

        return ResponseEntity.ok(
            ApiResponse.success("첨부파일 개수 조회가 완료되었습니다.", count)
        );
    }

    /**
     * 업로드자의 첨부파일 목록 조회
     */
    @GetMapping("/uploader/{uploadedBy}")
    public ResponseEntity<ApiResponse<List<AttachmentDto.Response>>> getAttachmentsByUploader(
            @PathVariable String uploadedBy) {
        
        List<AttachmentDto.Response> attachments = attachmentService.getAttachmentsByUploader(uploadedBy);

        return ResponseEntity.ok(
            ApiResponse.success("업로드자의 첨부파일 목록 조회가 완료되었습니다.", attachments)
        );
    }
}