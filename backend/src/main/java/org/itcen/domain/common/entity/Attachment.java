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

    @Column(name = "file_path", length = 500, nullable = false)
    private String filePath;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "original_filename", length = 255, nullable = false)
    private String originalFilename;

    @Column(name = "stored_filename", length = 255, nullable = false)
    private String storedFilename;

    @Column(name = "uploaded_by", length = 100, nullable = false)
    private String uploadedBy;

    @Column(name = "entity_type", length = 50, nullable = false)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(name = "created_id", length = 100)
    private String createdId;

    @Column(name = "updated_id", length = 100)
    private String updatedId;

    @Builder
    public Attachment(String contentType, String filePath, Long fileSize, 
                     String originalFilename, String storedFilename, String uploadedBy,
                     String entityType, Long entityId, String createdId) {
        this.contentType = contentType;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.originalFilename = originalFilename;
        this.storedFilename = storedFilename;
        this.uploadedBy = uploadedBy;
        this.entityType = entityType;
        this.entityId = entityId;
        this.createdId = createdId;
        this.updatedId = createdId; // 생성 시에는 생성자와 수정자가 동일
    }

    /**
     * 첨부파일 정보 수정
     */
    public void updateFileInfo(String originalFilename, String storedFilename, 
                              Long fileSize, String contentType, String updatedBy) {
        this.originalFilename = originalFilename;
        this.storedFilename = storedFilename;
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