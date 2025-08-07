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

    /**
     * 모든 내부통제 메뉴얼 조회 (페이징)
     */
    Page<InternalControlManual> getAllManuals(Pageable pageable);

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
     * 초안으로 되돌리기
     */
    void revertToDraft(Long manualId, String actorEmpNo, String reason);

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
     * 상태별 내부통제 메뉴얼 조회
     */
    List<InternalControlManualDto> getManualsByStatus(InternalControlManual.ManualStatus status);

    /**
     * 작성자별 내부통제 메뉴얼 조회
     */
    List<InternalControlManualDto> getManualsByAuthor(String authorEmpNo);

    /**
     * 부서의 최신 발행 메뉴얼 조회
     */
    List<InternalControlManualDto> getLatestPublishedManuals(String deptCd);

    /**
     * 유효한 메뉴얼 조회
     */
    List<InternalControlManualDto> getValidManuals();

    /**
     * 만료 예정 메뉴얼 조회
     */
    List<InternalControlManualDto> getExpiringManuals(int daysFromNow);

    /**
     * 승인 대기중인 메뉴얼 조회
     */
    List<InternalControlManualDto> getPendingApprovalManuals();

    /**
     * 복합 조건 검색
     */
    Page<InternalControlManualDto> searchManuals(org.itcen.domain.handover.dto.ManualSearchDto searchDto, Pageable pageable);

    // 통계 기능

    /**
     * 메뉴얼 통계
     */
    ManualStatisticsDto getManualStatistics();

    /**
     * 부서별 통계
     */
    List<DepartmentStatisticsDto> getManualStatisticsByDepartment();

    /**
     * 분류별 통계
     */
    List<CategoryStatisticsDto> getManualStatisticsByCategory();

    /**
     * 월별 생성 통계
     */
    List<MonthlyStatisticsDto> getMonthlyCreationStatistics();

    // DTO 인터페이스들

    interface InternalControlManualDto {
        Long getManualId();
        String getDeptCd();
        String getDeptName(); 
        String getManualTitle();
        String getManualVersion();
        String getManualContent();
        InternalControlManual.ManualStatus getStatus();
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

    interface ManualStatisticsDto {
        Long getTotalManuals();
        Long getDraftManuals();
        Long getPublishedManuals();
        Long getExpiringManuals();
        Double getApprovalRate();
    }

    interface DepartmentStatisticsDto {
        String getDeptCd();
        String getDeptName();
        Long getManualCount();
        Long getPublishedCount();
    }

    interface CategoryStatisticsDto {
        String getCategory();
        Long getManualCount();
    }

    interface MonthlyStatisticsDto {
        Integer getYear();
        Integer getMonth();
        Long getCreatedCount();
    }
}