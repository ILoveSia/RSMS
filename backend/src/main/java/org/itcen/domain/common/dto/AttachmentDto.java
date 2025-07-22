package org.itcen.domain.common.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.itcen.domain.common.entity.Attachment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * 첨부파일 관련 DTO 클래스들
 * 
 * 첨부파일 API 요청/응답을 위한 DTO들을 정의합니다.
 * 클린 아키텍처 원칙에 따라 Entity와 분리하여 관리합니다.
 */
public class AttachmentDto {

    /**
     * 첨부파일 업로드 요청 DTO
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UploadRequest {
        
        @NotBlank(message = "엔티티 타입은 필수입니다")
        @Size(max = 50, message = "엔티티 타입은 50자를 초과할 수 없습니다")
        private String entityType;
        
        @NotNull(message = "엔티티 ID는 필수입니다")
        private Long entityId;
        
        @NotBlank(message = "업로드자 ID는 필수입니다")
        @Size(max = 100, message = "업로드자 ID는 100자를 초과할 수 없습니다")
        private String uploadedBy;
        
        // 파일 정보는 MultipartFile로 별도 처리
    }

    /**
     * 첨부파일 응답 DTO
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        
        private Long attachId;
        private String contentType;
        private String filePath;
        private Long fileSize;
        private String originalFilename;
        private String storedFilename;
        private String uploadedBy;
        private String entityType;
        private Long entityId;
        private String createdId;
        private LocalDateTime createdAt;
        private String updatedId;
        private LocalDateTime updatedAt;
        
        /**
         * Entity를 DTO로 변환
         */
        public static Response from(Attachment attachment) {
            return Response.builder()
                    .attachId(attachment.getAttachId())
                    .contentType(attachment.getContentType())
                    .filePath(attachment.getFilePath())
                    .fileSize(attachment.getFileSize())
                    .originalFilename(attachment.getOriginalName())
                    .storedFilename(attachment.getStoredName())
                    .uploadedBy(attachment.getUploadedBy())
                    .entityType(attachment.getEntityType())
                    .entityId(attachment.getEntityId())
                    .createdId(attachment.getCreatedId())
                    .createdAt(attachment.getCreatedAt())
                    .updatedId(attachment.getUpdatedId())
                    .updatedAt(attachment.getUpdatedAt())
                    .build();
        }
    }

    /**
     * 첨부파일 목록 조회 요청 DTO
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ListRequest {
        
        @NotBlank(message = "엔티티 타입은 필수입니다")
        private String entityType;
        
        @NotNull(message = "엔티티 ID는 필수입니다")
        private Long entityId;
    }

    /**
     * 첨부파일 다운로드 정보 DTO
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DownloadInfo {
        
        private String originalFilename;
        private String contentType;
        private Long fileSize;
        private String filePath;
        
        /**
         * Entity에서 다운로드 정보 추출
         */
        public static DownloadInfo from(Attachment attachment) {
            return DownloadInfo.builder()
                    .originalFilename(attachment.getOriginalName())
                    .contentType(attachment.getContentType())
                    .fileSize(attachment.getFileSize())
                    .filePath(attachment.getFilePath())
                    .build();
        }
    }

    /**
     * 첨부파일 삭제 요청 DTO
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeleteRequest {
        
        @NotNull(message = "첨부파일 ID는 필수입니다")
        private Long attachId;
        
        @NotBlank(message = "삭제자 ID는 필수입니다")
        private String deletedBy;
    }

    /**
     * 첨부파일 일괄 삭제 요청 DTO
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkDeleteRequest {
        
        @NotNull(message = "첨부파일 ID 목록은 필수입니다")
        private java.util.List<Long> attachIds;
        
        @NotBlank(message = "삭제자 ID는 필수입니다")
        private String deletedBy;
    }

    /**
     * 첨부파일 업로드 결과 DTO
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UploadResult {
        
        private Long attachId;
        private String originalFilename;
        private String storedFilename;
        private Long fileSize;
        private String message;
        
        public static UploadResult success(Attachment attachment) {
            return UploadResult.builder()
                    .attachId(attachment.getAttachId())
                    .originalFilename(attachment.getOriginalName())
                    .storedFilename(attachment.getStoredName())
                    .fileSize(attachment.getFileSize())
                    .message("파일 업로드가 완료되었습니다.")
                    .build();
        }
        
        public static UploadResult failure(String filename, String message) {
            return UploadResult.builder()
                    .originalFilename(filename)
                    .message(message)
                    .build();
        }
    }
}