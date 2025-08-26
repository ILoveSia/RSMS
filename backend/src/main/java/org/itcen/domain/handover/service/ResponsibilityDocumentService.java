package org.itcen.domain.handover.service;

import org.itcen.domain.handover.dto.ApprovalStartRequestDto;
import org.itcen.domain.handover.entity.ResponsibilityDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 책무기술서 서비스 인터페이스
 * 책무기술서 관련 비즈니스 로직을 정의합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 책무기술서 비즈니스 로직만 담당
 * - Open/Closed: 새로운 문서 관리 기능 추가 시 확장 가능
 * - Liskov Substitution: 구현체 간 호환성 보장
 * - Interface Segregation: 책무기술서 관련 메서드만 정의
 * - Dependency Inversion: 구현체가 아닌 인터페이스에 의존
 */
public interface ResponsibilityDocumentService {

    // 기본 CRUD 작업

    /**
     * 책무기술서 생성
     */
    ResponsibilityDocument createDocument(ResponsibilityDocument document);

    /**
     * 책무기술서 수정
     */
    ResponsibilityDocument updateDocument(Long documentId, ResponsibilityDocument document);

    /**
     * 책무기술서 조회
     */
    Optional<ResponsibilityDocument> getDocument(Long documentId);

    /**
     * 책무기술서 삭제
     */
    void deleteDocument(Long documentId);

    /**
     * 모든 책무기술서 조회 (페이징)
     */
    Page<ResponsibilityDocument> getAllDocuments(Pageable pageable);

    // 비즈니스 로직

    /**
     * 검토 단계로 제출
     */
    void submitForReview(Long documentId, String reviewerEmpNo, String actorEmpNo);

    /**
     * 문서 승인
     */
    void approveDocument(Long documentId, String approverEmpNo, String actorEmpNo);

    /**
     * 문서 발행
     */
    void publishDocument(Long documentId, String actorEmpNo);
    /**
     * 문서 버전 업데이트
     */
    ResponsibilityDocument updateVersion(Long documentId, String newVersion, String actorEmpNo);

    // 조회 기능

    

    /**
     * 상태별 책무기술서 조회
     */
    List<ResponsibilityDocumentDto> getDocumentsByStatus(String status);

    /**
     * 작성자별 책무기술서 조회
     */
    List<ResponsibilityDocumentDto> getDocumentsByAuthor(String authorEmpNo);

    /**
     * 유효한 문서 조회
     */
    List<ResponsibilityDocumentDto> getValidDocuments();
    /**
     * 승인 대기중인 문서 조회
     */
    List<ResponsibilityDocumentDto> getPendingApprovalDocuments();

    /**
     * 복합 조건 검색
     */
    Page<ResponsibilityDocumentDto> searchDocuments(DocumentSearchDto searchDto, Pageable pageable);
    // 결재 연동 기능

    /**
     * 결재 테이블과 조인하여 문서 검색
     */
    Page<ResponsibilityDocumentWithApprovalDto> searchDocumentsWithApproval(DocumentSearchDto searchDto, Pageable pageable);

    /**
     * 결재 요청 시작
     */
    void startApproval(Long documentId, ApprovalStartRequestDto request);

    /**
     * 결재 승인
     */
    void approveApproval(Long documentId, String comment);

    /**
     * 결재 반려
     */
    void rejectApproval(Long documentId, String reason);

    /**
     * 결재 취소
     */
    void cancelApproval(Long documentId);

    // DTO 인터페이스들

    interface ResponsibilityDocumentDto {
        Long getDocumentId();
        Long getPositionId();
        String getPositionName();
        Long getResponsibilityId();
        String getDocumentTitle();
        String getDocumentVersion();
        String getDocumentContent();
        String getStatus();
        Long getApprovalId();
        LocalDate getEffectiveDate();
        LocalDate getExpiryDate();
        String getAuthorEmpNo();
        // 검토자, 승인자는 approval 테이블에서 관리
        
        // 첨부파일 관련
        Long getAttachmentCount();
        List<AttachmentInfo> getAttachments();
    }

    interface DocumentSearchDto {
        Long getPositionId();
        String getAuthorEmpNo();
        String getDocumentTitle();
        String getPositionName();
        LocalDate getStartDate();
        LocalDate getEndDate();
    }

    interface DocumentStatisticsDto {
        Long getTotalDocuments();
        Long getDraftDocuments();
        Long getPublishedDocuments();
        Long getExpiringDocuments();
        Double getApprovalRate();
    }

    interface MonthlyStatisticsDto {
        Integer getYear();
        Integer getMonth();
        Long getCreatedCount();
    }

    interface StatusStatisticsDto {
        String getStatus();
        Long getCount();
        Double getPercentage();
    }

    // 결재 연동 DTO 인터페이스들

    /**
     * 결재 정보가 포함된 책무기술서 DTO
     */
    interface ResponsibilityDocumentWithApprovalDto {
        Long getDocumentId();
        Long getPositionId();
        String getPositionName();
        Long getResponsibilityId();
        String getDocumentTitle();
        String getDocumentVersion();
        String getDocumentContent();
        String getStatus(); // status 필드 제거됨, 항상 null 반환
        Long getApprovalId();
        LocalDate getEffectiveDate();
        LocalDate getExpiryDate();
        String getAuthorEmpNo();
        
        // 감사 필드
        LocalDate getCreatedAt();
        LocalDate getUpdatedAt();
        String getCreatedId();
        String getUpdatedId();
        
        // 첨부파일 관련
        Long getAttachmentCount();
        List<AttachmentInfo> getAttachments();
        
        // 결재 관련 필드
        String getApprovalStatus();
        String getRequesterId();
        String getRequesterName();
        String getCurrentApproverId();
        String getCurrentApproverName();
        LocalDate getApprovedAt();
        LocalDate getRejectedAt();
        String getRejectionReason();
        
        // 작성자명 추가
        String getAuthorName();
    }

    /**
     * 첨부파일 정보 인터페이스
     */
    interface AttachmentInfo {
        Long getAttachId();
        String getOriginalName();
        String getStoredName();
        Long getFileSize();
        String getMimeType();
    }

}