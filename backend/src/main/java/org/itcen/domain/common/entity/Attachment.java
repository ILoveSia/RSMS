package org.itcen.domain.common.entity;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import org.itcen.common.entity.BaseTimeEntity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 첨부파일 엔티티
 * 
 * 범용적인 첨부파일 관리를 위한 엔티티입니다.
 * entity_type과 entity_id를 통해 다양한 엔티티에 연결 가능합니다.
 * 
 * 설계 원칙:
 * - Single Responsibility: 첨부파일 정보만 관리
 * - Open/Closed: 새로운 엔티티 타입 추가에 열려있음
 * - Dependency Inversion: 특정 엔티티에 의존하지 않음
 */
@Entity
@Table(name = "attachments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(callSuper = false)
public class Attachment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attach_id")
    private Long attachId;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_path", length = 500, nullable = false)
    private String filePath;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "original_name", length = 255, nullable = false)
    private String originalName;

    @Column(name = "stored_name", length = 255, nullable = false)
    private String storedName;

    @Column(name = "uploaded_by", length = 100, nullable = false)
    private String uploadedBy;
    
    @Column(name = "upload_date", nullable = false)
    private LocalDateTime uploadDate;

    @Column(name = "entity_type", length = 50, nullable = false)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(name = "created_id", length = 100)
    private String createdId;

    @Column(name = "updated_id", length = 100)
    private String updatedId;
    
    @Column(name = "deleted_yn", length = 1)
    private String deletedYn;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @Column(name = "deleted_by", length = 100)
    private String deletedBy;

    @Builder
    public Attachment(String contentType, String mimeType, String filePath, Long fileSize, 
                     String originalName, String storedName, String uploadedBy,
                     String entityType, Long entityId, String createdId) {
        this.contentType = contentType;
        this.mimeType = mimeType;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.originalName = originalName;
        this.storedName = storedName;
        this.uploadedBy = uploadedBy;
        this.uploadDate = LocalDateTime.now(); // 업로드 시간 자동 설정
        this.entityType = entityType;
        this.entityId = entityId;
        this.createdId = createdId;
        this.updatedId = createdId; // 생성 시에는 생성자와 수정자가 동일
        this.deletedYn = "N"; // 기본값으로 삭제되지 않음으로 설정
    }

    /**
     * 첨부파일 정보 수정
     */
    public void updateFileInfo(String originalName, String storedName, 
                              Long fileSize, String contentType, String updatedBy) {
        this.originalName = originalName;
        this.storedName = storedName;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.updatedId = updatedBy;
    }

    /**
     * 엔티티 연결 정보 수정
     */
    public void updateEntityInfo(String entityType, Long entityId, String updatedBy) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.updatedId = updatedBy;
    }

    /**
     * 파일 경로 수정
     */
    public void updateFilePath(String filePath, String updatedBy) {
        this.filePath = filePath;
        this.updatedId = updatedBy;
    }
}