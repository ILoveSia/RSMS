package org.itcen.domain.audit.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * 감사프로그램관리 등록 요청 DTO
 *
 * 감사프로그램관리 등록/수정 시 사용되는 요청 데이터를 담는 DTO입니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 감사프로그램관리 등록/수정 요청 데이터만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 필요한 데이터만 포함
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditProgMngtCreateRequestDto {

    /**
     * 감사프로그램관리 코드
     */
    @NotBlank(message = "감사프로그램관리 코드는 필수입니다.")
    @Size(max = 20, message = "감사프로그램관리 코드는 20자 이하여야 합니다.")
    private String auditProgMngtCd;

    /**
     * 감사프로그램명
     */
    @NotBlank(message = "감사프로그램명은 필수입니다.")
    @Size(max = 200, message = "감사프로그램명은 200자 이하여야 합니다.")
    private String auditProgName;

    /**
     * 감사유형코드
     */
    @Size(max = 20, message = "감사유형코드는 20자 이하여야 합니다.")
    private String auditTypeCd;

    /**
     * 감사대상
     */
    @Size(max = 200, message = "감사대상은 200자 이하여야 합니다.")
    private String auditTarget;

    /**
     * 감사기간 시작일
     */
    private LocalDate auditStartDate;

    /**
     * 감사기간 종료일
     */
    private LocalDate auditEndDate;

    /**
     * 감사팀장
     */
    @Size(max = 100, message = "감사팀장은 100자 이하여야 합니다.")
    private String auditTeamLeader;

    /**
     * 감사팀원
     */
    @Size(max = 500, message = "감사팀원은 500자 이하여야 합니다.")
    private String auditTeamMembers;

    /**
     * 감사상태코드
     */
    @Size(max = 20, message = "감사상태코드는 20자 이하여야 합니다.")
    private String auditStatusCd;

    /**
     * 비고
     */
    @Size(max = 1000, message = "비고는 1000자 이하여야 합니다.")
    private String remarks;
}