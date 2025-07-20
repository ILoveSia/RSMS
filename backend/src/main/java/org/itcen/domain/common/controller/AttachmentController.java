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
@RequestMapping("/api/attachments")
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
        
        log.info("파일 업로드 API 호출, 파일 개수: {}, 엔티티: {}-{}", 
                files.length, entityType, entityId);

        try {
            AttachmentDto.UploadRequest uploadRequest = AttachmentDto.UploadRequest.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .uploadedBy(uploadedBy)
                    .build();

            List<AttachmentDto.UploadResult> results = attachmentService
                    .uploadFiles(Arrays.asList(files), uploadRequest);

            log.info("파일 업로드 완료, 성공: {}, 전체: {}", 
                    results.stream().filter(r -> r.getAttachId() != null).count(), results.size());

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
        
        log.info("단일 파일 업로드 API 호출: {}, 엔티티: {}-{}", 
                file.getOriginalFilename(), entityType, entityId);

        try {
            AttachmentDto.UploadRequest uploadRequest = AttachmentDto.UploadRequest.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .uploadedBy(uploadedBy)
                    .build();

            AttachmentDto.UploadResult result = attachmentService.uploadFile(file, uploadRequest);

            log.info("단일 파일 업로드 완료: {}", file.getOriginalFilename());

            return ResponseEntity.ok(
                ApiResponse.success("파일 업로드가 완료되었습니다.", result)
            );

        } catch (IOException e) {
            log.error("단일 파일 업로드 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("파일 업로드에 실패했습니다."));
        }
    }

    /**
     * 엔티티의 첨부파일 목록 조회
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<AttachmentDto.Response>>> getAttachmentsByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        
        log.info("엔티티 첨부파일 목록 조회 API 호출: {}-{}", entityType, entityId);

        List<AttachmentDto.Response> attachments = attachmentService
                .getAttachmentsByEntity(entityType, entityId);

        log.info("엔티티 첨부파일 목록 조회 완료: {}-{}, 파일 수: {}", 
                entityType, entityId, attachments.size());

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
        
        log.info("첨부파일 상세 조회 API 호출: {}", attachId);

        AttachmentDto.Response attachment = attachmentService.getAttachmentById(attachId);

        log.info("첨부파일 상세 조회 완료: {}", attachId);

        return ResponseEntity.ok(
            ApiResponse.success("첨부파일 조회가 완료되었습니다.", attachment)
        );
    }

    /**
     * 첨부파일 다운로드
     */
    @GetMapping("/download/{attachId}")
    public ResponseEntity<InputStreamResource> downloadFile(@PathVariable Long attachId) {
        
        log.info("첨부파일 다운로드 API 호출: {}", attachId);

        try {
            AttachmentDto.DownloadInfo downloadInfo = attachmentService.getDownloadInfo(attachId);

            FileInputStream fileInputStream = new FileInputStream(downloadInfo.getFilePath());
            InputStreamResource resource = new InputStreamResource(fileInputStream);

            log.info("첨부파일 다운로드 완료: {}", downloadInfo.getOriginalFilename());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + downloadInfo.getOriginalFilename() + "\"")
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
        
        log.info("첨부파일 삭제 API 호출: {}", attachId);

        attachmentService.deleteAttachment(attachId, deletedBy);

        log.info("첨부파일 삭제 완료: {}", attachId);

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
        
        log.info("첨부파일 일괄 삭제 API 호출, 삭제 대상: {}", deleteRequest.getAttachIds().size());

        attachmentService.deleteAttachments(deleteRequest.getAttachIds(), deleteRequest.getDeletedBy());

        log.info("첨부파일 일괄 삭제 완료: {}", deleteRequest.getAttachIds().size());

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
        
        log.info("엔티티 첨부파일 전체 삭제 API 호출: {}-{}", entityType, entityId);

        attachmentService.deleteAllAttachmentsByEntity(entityType, entityId, deletedBy);

        log.info("엔티티 첨부파일 전체 삭제 완료: {}-{}", entityType, entityId);

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
        
        log.info("엔티티 첨부파일 개수 조회 API 호출: {}-{}", entityType, entityId);

        long count = attachmentService.getAttachmentCount(entityType, entityId);

        log.info("엔티티 첨부파일 개수 조회 완료: {}-{}, 개수: {}", entityType, entityId, count);

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
        
        log.info("업로드자 첨부파일 목록 조회 API 호출: {}", uploadedBy);

        List<AttachmentDto.Response> attachments = attachmentService.getAttachmentsByUploader(uploadedBy);

        log.info("업로드자 첨부파일 목록 조회 완료: {}, 파일 수: {}", uploadedBy, attachments.size());

        return ResponseEntity.ok(
            ApiResponse.success("업로드자의 첨부파일 목록 조회가 완료되었습니다.", attachments)
        );
    }
}