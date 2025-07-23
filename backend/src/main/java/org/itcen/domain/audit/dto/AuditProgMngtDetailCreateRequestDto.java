package org.itcen.domain.audit.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 감사프로그램관리상세 등록 요청 DTO
 *
 * 감사프로그램관리상세 등록/수정 시 사용되는 요청 데이터를 담는 DTO입니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 감사프로그램관리상세 등록/수정 요청 데이터만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 필요한 데이터만 포함
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditProgMngtDetailCreateRequestDto {

    /**
     * 감사프로그램관리 코드
     */
    @NotBlank(message = "감사프로그램관리 코드는 필수입니다.")
    @Size(max = 20, message = "감사프로그램관리 코드는 20자 이하여야 합니다.")
    private String auditProgMngtCd;

    /**
     * 점검항목명
     */
    @NotBlank(message = "점검항목명은 필수입니다.")
    @Size(max = 200, message = "점검항목명은 200자 이하여야 합니다.")
    private String auditItemName;

    /**
     * 점검내용
     */
    @Size(max = 1000, message = "점검내용은 1000자 이하여야 합니다.")
    private String auditContent;

    /**
     * 점검방법
     */
    @Size(max = 500, message = "점검방법은 500자 이하여야 합니다.")
    private String auditMethod;

    /**
     * 점검기준
     */
    @Size(max = 500, message = "점검기준은 500자 이하여야 합니다.")
    private String auditStandard;

    /**
     * 위험도
     */
    @Size(max = 20, message = "위험도는 20자 이하여야 합니다.")
    private String riskLevel;

    /**
     * 중요도
     */
    @Size(max = 20, message = "중요도는 20자 이하여야 합니다.")
    private String importanceLevel;

    /**
     * 점검결과
     */
    @Size(max = 1000, message = "점검결과는 1000자 이하여야 합니다.")
    private String auditResult;

    /**
     * 발견사항
     */
    @Size(max = 2000, message = "발견사항은 2000자 이하여야 합니다.")
    private String findings;

    /**
     * 개선권고사항
     */
    @Size(max = 2000, message = "개선권고사항은 2000자 이하여야 합니다.")
    private String recommendations;

    /**
     * 점검상태코드
     */
    @Size(max = 20, message = "점검상태코드는 20자 이하여야 합니다.")
    private String auditStatusCd;

    /**
     * 정렬순서
     */
    private Integer sortOrder;
}