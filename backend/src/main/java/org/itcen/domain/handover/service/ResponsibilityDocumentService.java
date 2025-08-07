package org.itcen.domain.handover.service;

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
     * 초안으로 되돌리기
     */
    void revertToDraft(Long documentId, String actorEmpNo, String reason);

    /**
     * 문서 버전 업데이트
     */
    ResponsibilityDocument updateVersion(Long documentId, String newVersion, String actorEmpNo);

    // 조회 기능

    /**
     * 직책별 책무기술서 조회
     */
    List<ResponsibilityDocumentDto> getDocumentsByPosition(Long positionId);

    /**
     * 상태별 책무기술서 조회
     */
    List<ResponsibilityDocumentDto> getDocumentsByStatus(ResponsibilityDocument.DocumentStatus status);

    /**
     * 작성자별 책무기술서 조회
     */
    List<ResponsibilityDocumentDto> getDocumentsByAuthor(String authorEmpNo);

    /**
     * 직책의 최신 발행 문서 조회
     */
    Optional<ResponsibilityDocumentDto> getLatestPublishedDocument(Long positionId);

    /**
     * 유효한 문서 조회
     */
    List<ResponsibilityDocumentDto> getValidDocuments();

    /**
     * 만료 예정 문서 조회
     */
    List<ResponsibilityDocumentDto> getExpiringDocuments(int daysFromNow);

    /**
     * 승인 대기중인 문서 조회
     */
    List<ResponsibilityDocumentDto> getPendingApprovalDocuments();

    /**
     * 복합 조건 검색
     */
    Page<ResponsibilityDocumentDto> searchDocuments(DocumentSearchDto searchDto, Pageable pageable);

    // 통계 기능

    /**
     * 문서 통계
     */
    DocumentStatisticsDto getDocumentStatistics();

    /**
     * 월별 생성 통계
     */
    List<MonthlyStatisticsDto> getMonthlyCreationStatistics();

    /**
     * 상태별 통계
     */
    List<StatusStatisticsDto> getStatusStatistics();

    // DTO 인터페이스들

    interface ResponsibilityDocumentDto {
        Long getDocumentId();
        Long getPositionId();
        String getPositionName();
        Long getResponsibilityId();
        String getDocumentTitle();
        String getDocumentVersion();
        String getDocumentContent();
        ResponsibilityDocument.DocumentStatus getStatus();
        Long getApprovalId();
        LocalDate getEffectiveDate();
        LocalDate getExpiryDate();
        String getAuthorEmpNo();
        String getAuthorName();
        String getReviewerEmpNo();
        String getReviewerName();
        String getApproverEmpNo();
        String getApproverName();
    }

    interface DocumentSearchDto {
        Long getPositionId();
        ResponsibilityDocument.DocumentStatus getStatus();
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
        ResponsibilityDocument.DocumentStatus getStatus();
        Long getCount();
        Double getPercentage();
    }
}