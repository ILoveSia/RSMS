package org.itcen.domain.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 미흡상황 현황 DTO
 * 
 * 단일 책임 원칙(SRP): 미흡상황 현황 데이터 전송만 담당
 * 개방-폐쇄 원칙(OCP): 필요시 상속을 통해 확장 가능
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeficiencyStatusDto {

    // audit_prog_mngt_detail 테이블 관련 필드 (실제 DB 컬럼)
    private Long auditProgMngtDetailId; // 점검계획상세 ID
    private Long auditProgMngtId; // 점검계획 ID
    private Long hodIcItemId; // 부서장 내부통제 항목 ID
    private String auditMenId; // 점검자 지정
    private String auditResult; // 점검 결과 작성
    private String auditResultStatusCd; // 점검결과상태코드 ('미흡')
    private String beforeAuditYn; // 이전회차 동일건 여부
    private String auditDetailContent; // 개선계획 세부내용
    private LocalDate auditDoneDt; // 이행완료 예정일자
    private String auditDoneContent; // 이행결과 내용
    private String impPlStatusCd; // 개선계획상태코드
    
    // 화면 표시용 필드 (기존 필드들을 매핑용으로 유지)
    private String deficiencyContent; // 미흡사항 내용 (audit_result 매핑)
    private String improvementPlan; // 개선계획 (audit_detail_content 매핑)
    private String implementationResult; // 이행결과 (상태에 따른 표시)
    private LocalDate dueDate; // 완료예정일 (audit_done_dt 매핑)
    private LocalDate completionDate; // 완료일자
    private String statusCode; // 상태코드
    private String priority; // 우선순위
    private String remarks; // 비고

    // audit_prog_mngt 테이블 관련 필드
    private String auditProgMngtCd; // 점검계획코드
    private Long ledgerOrdersHod; // 책무번호
    private String auditTitle; // 점검회차명
    private LocalDate auditStartDt; // 점검시작일
    private LocalDate auditEndDt; // 점검종료일
    private String auditStatusCd; // 점검상태코드
    private String auditContents; // 점검내용

    // 추가 정보 필드
    private String inspector; // 점검자
    private String inspectorId; // 점검자 ID
    private String department; // 부서
    private String inspectionRound; // 점검회차
    private String statusName; // 상태명
    private String writeDate; // 작성일자 (문자열)
    private String createdAt; // 등록일자 (문자열)
    private String updatedAt; // 최종수정일자 (문자열)
    private String createdId; // 생성자 ID
    private String updatedId; // 수정자 ID

    /**
     * 점검회차명을 inspectionRound로 설정
     */
    public void setInspectionRoundFromAuditTitle() {
        this.inspectionRound = this.auditTitle;
    }

    /**
     * 작성일자를 점검시작일로 설정
     */
    public void setWriteDateFromAuditStartDt() {
        if (this.auditStartDt != null) {
            this.writeDate = this.auditStartDt.toString();
        }
    }
}