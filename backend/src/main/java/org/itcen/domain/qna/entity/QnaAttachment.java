package org.itcen.domain.qna.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;

/**
 * Q&A 첨부파일 엔티티
 * 
 * Q&A에 첨부된 파일 정보를 관리하는 엔티티입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 첨부파일 정보만 담당
 * - Open/Closed: 새로운 파일 속성 추가 시 확장 가능
 * - Liskov Substitution: 파일 관련 인터페이스 구현 시 안전하게 대체 가능
 */
@Entity
@Table(name = "qna_attachments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QnaAttachment {

    /**
     * 첨부파일 ID (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Q&A (다대일 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "qna_id", nullable = false)
    private Qna qna;

    /**
     * 원본 파일명
     */
    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    /**
     * 저장된 파일명 (UUID 등으로 생성된 고유 파일명)
     */
    @Column(name = "stored_filename", nullable = false, length = 255)
    private String storedFilename;

    /**
     * 파일 경로
     */
    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    /**
     * 파일 크기 (bytes)
     */
    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    /**
     * 파일 타입 (MIME Type)
     */
    @Column(name = "content_type", length = 100)
    private String contentType;

    /**
     * 업로드한 사용자 ID (PostgreSQL 테이블 구조에 맞춰 String으로 변경)
     */
    @Column(name = "uploaded_by", nullable = false, length = 100)
    private String uploadedBy;

    /**
     * 생성일시
     */
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * 수정일시
     */
    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    /**
     * 생성자 ID
     */
    @Column(name = "created_id", length = 100)
    private String createdId;

    /**
     * 수정자 ID
     */
    @Column(name = "updated_id", length = 100)
    private String updatedId;

    /**
     * 파일 크기를 사람이 읽기 쉬운 형태로 반환하는 메서드
     * 
     * @return 포맷된 파일 크기 (예: "1.5 MB")
     */
    public String getFormattedFileSize() {
        if (fileSize == null) {
            return "0 B";
        }
        
        long size = fileSize;
        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return String.format("%.1f %s", (double) size, units[unitIndex]);
    }

    /**
     * 파일 확장자를 반환하는 메서드
     * 
     * @return 파일 확장자 (점 포함, 예: ".pdf")
     */
    public String getFileExtension() {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return "";
        }
        return originalFilename.substring(originalFilename.lastIndexOf("."));
    }

    /**
     * 이미지 파일 여부를 확인하는 메서드
     * 
     * @return 이미지 파일 여부
     */
    public boolean isImageFile() {
        if (contentType == null) {
            return false;
        }
        return contentType.startsWith("image/");
    }

    /**
     * 다운로드 가능한 파일인지 확인하는 메서드
     * 
     * @return 다운로드 가능 여부
     */
    public boolean isDownloadable() {
        return filePath != null && !filePath.isEmpty();
    }

    /**
     * 엔티티 생성 전 처리
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        String currentUserId = getCurrentUserId();
        
        this.createdAt = now;
        this.updatedAt = now;
        this.createdId = currentUserId;
        this.updatedId = currentUserId;
    }

    /**
     * 엔티티 수정 전 처리
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.updatedId = getCurrentUserId();
    }

    /**
     * 현재 인증된 사용자의 ID를 가져옵니다.
     */
    private String getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getPrincipal())) {
                return authentication.getName();
            }
        } catch (Exception e) {
            // SecurityContext에서 인증 정보를 가져올 수 없는 경우
        }
        return "system";
    }
}