package org.itcen.domain.handover.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.handover.entity.ResponsibilityDocument;

import java.time.LocalDate;

/**
 * 책무기술서 DTO
 * 책무기술서 정보 전송을 위한 데이터 전송 객체입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 책무기술서 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Liskov Substitution: ResponsibilityDocumentDto 인터페이스 구현
 * - Interface Segregation: 필요한 데이터만 포함
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponsibilityDocumentDto {
    
    private Long documentId;
    private String documentTitle;
    private String documentVersion;
    private String documentContent;
    private String status;
    private Long approvalId;
    private LocalDate effectiveDate;
    private LocalDate expiryDate;
    private String authorEmpNo;
    private String authorName;
    // 검토자, 승인자는 approval 테이블에서 관리
    
    // 계산된 필드들
    private boolean isValid;
    private boolean isExpiring;
    private int daysUntilExpiry;
    private String workflowStatus;
    
    // 추가 정보 필드들
    private String deptCd;
    private String deptName;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    private String createdByName;
    private String updatedByName;
    
    // 첨부파일 정보
    private Long attachmentCount;
    private String attachmentFileNames;
}

