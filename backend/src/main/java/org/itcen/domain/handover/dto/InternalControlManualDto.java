package org.itcen.domain.handover.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.handover.entity.InternalControlManual;

import java.time.LocalDate;

/**
 * 내부통제 업무메뉴얼 DTO
 * 내부통제 업무메뉴얼 정보 전송을 위한 데이터 전송 객체입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 내부통제 메뉴얼 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Liskov Substitution: InternalControlManualDto 인터페이스 구현
 * - Interface Segregation: 필요한 데이터만 포함
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InternalControlManualDto {
    
    private Long manualId;
    private String deptCd;
    private String deptName;
    private Long hodIcItemId;
    private String manualTitle;
    private String manualVersion;
    private String manualDescription;
    private String manualContent;
    private String manualCategory;
    private String icTaskCategory;
    private String status;
    private Long approvalId;
    private LocalDate effectiveDate;
    private LocalDate expiryDate;
    private Integer reviewCycleMonths;
    private LocalDate nextReviewDate;
    private String authorEmpNo;
    private String authorName;
    private String hodEmpNo;
    private String hodName;
    
    // 계산된 필드들
    private boolean isValid;
    private boolean isExpiring;
    private boolean needsReview;
    private int daysUntilExpiry;
    private int daysUntilReview;
    private String workflowStatus;
    
    // 추가 정보 필드들
    private LocalDate createdAt;
    private LocalDate updatedAt;
    private String createdByName;
    private String updatedByName;
    
    // 내부통제 항목 정보
    private String hodIcItemTitle;
    private String hodIcItemDescription;
    
    // 첨부파일 정보
    private Long attachmentCount;
    private String attachmentFileNames;
    
    // 통계 정보
    private Long viewCount;
    private LocalDate lastViewedAt;
}