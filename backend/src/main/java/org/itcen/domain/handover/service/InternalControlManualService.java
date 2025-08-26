package org.itcen.domain.handover.service;

import org.itcen.domain.handover.entity.InternalControlManual;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 내부통제 업무메뉴얼 서비스 인터페이스
 * 내부통제 업무메뉴얼 관련 비즈니스 로직을 정의합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 내부통제 메뉴얼 비즈니스 로직만 담당
 * - Open/Closed: 새로운 메뉴얼 관리 기능 추가 시 확장 가능
 * - Liskov Substitution: 구현체 간 호환성 보장
 * - Interface Segregation: 내부통제 메뉴얼 관련 메서드만 정의
 * - Dependency Inversion: 구현체가 아닌 인터페이스에 의존
 */
public interface InternalControlManualService {

    // 기본 CRUD 작업

    /**
     * 내부통제 메뉴얼 생성
     */
    InternalControlManual createManual(InternalControlManual manual);

    /**
     * 내부통제 메뉴얼 수정
     */
    InternalControlManual updateManual(Long manualId, InternalControlManual manual);

    /**
     * 내부통제 메뉴얼 조회
     */
    Optional<InternalControlManual> getManual(Long manualId);

    /**
     * 내부통제 메뉴얼 삭제
     */
    void deleteManual(Long manualId);

    // 비즈니스 로직

    /**
     * 검토 단계로 제출
     */
    void submitForReview(Long manualId, String actorEmpNo);

    /**
     * 메뉴얼 발행
     */
    void publishManual(Long manualId, String actorEmpNo);
    /**
     * 메뉴얼 버전 업데이트
     */
    InternalControlManual updateVersion(Long manualId, String newVersion, String actorEmpNo);

    // 조회 기능

    /**
     * 부서별 내부통제 메뉴얼 조회
     */
    List<InternalControlManualDto> getManualsByDepartment(String deptCd);
    /**
     * 작성자별 내부통제 메뉴얼 조회
     */
    List<InternalControlManualDto> getManualsByAuthor(String authorEmpNo);


    /**
     * 유효한 메뉴얼 조회
     */
    List<InternalControlManualDto> getValidManuals();


    /**
     * 승인 대기중인 메뉴얼 조회
     */
    List<InternalControlManualDto> getPendingApprovalManuals();

    /**
     * 복합 조건 검색
     */
    Page<InternalControlManualDto> searchManuals(org.itcen.domain.handover.dto.ManualSearchDto searchDto, Pageable pageable);

    /**
     * 결재 테이블과 조인하여 메뉴얼 검색
     */
    Page<InternalControlManualWithApprovalDto> searchManualsWithApproval(org.itcen.domain.handover.dto.ManualSearchDto searchDto, Pageable pageable);

    /**
     * 결재 요청 시작
     */
    void startApproval(Long manualId, org.itcen.domain.handover.dto.ApprovalStartRequestDto request);

    /**
     * 결재 승인
     */
    void approveApproval(Long manualId, String comment);

    /**
     * 결재 반려
     */
    void rejectApproval(Long manualId, String reason);

    /**
     * 결재 취소
     */
    void cancelApproval(Long manualId);

    // DTO 인터페이스들

    interface InternalControlManualDto {
        Long getManualId();
        String getDeptCd();
        String getDeptName(); 
        String getManualTitle();
        String getManualVersion();
        String getManualContent();
        // status, approval_id, reviewer_emp_no, approver_emp_no 컴럼 삭제됨
        LocalDate getEffectiveDate();
        LocalDate getExpiryDate();
        String getAuthorEmpNo();
    }
    // 결재 연동 DTO 인터페이스들

    /**
     * 결재 정보가 포함된 내부통제 메뉴얼 DTO
     */
    interface InternalControlManualWithApprovalDto {
        Long getManualId();
        String getDeptCd();
        String getDeptName();
        String getManualTitle();
        String getManualVersion();
        String getManualContent();
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
        Long getApprovalId();
        String getRequesterId();
        String getRequesterName();
        String getCurrentApproverId();
        String getCurrentApproverName();
        LocalDate getApprovedAt();
        LocalDate getRejectedAt();
        String getRejectionReason();
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