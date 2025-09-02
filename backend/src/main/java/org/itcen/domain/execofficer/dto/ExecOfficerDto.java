package org.itcen.domain.execofficer.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecOfficerDto {
    private Long execofficerId;
    private String empId;
    private String execofficer_dt;
    private String dualYn;
    private String dualDetails;
    private Long positionsId;
    private Long approvalId;
    private Long ledgerOrder;
    private String orderStatus;
    private String createdId;
    private String updatedId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String positionsNm;
    private String userName;
    private String empName;
    // employee 테이블 조인 필드 추가
    private String positionName;
    private String jobRankCd;
    // ledger_orders 테이블 조인 필드 추가
    private String ledgerOrdersStatusCd;
}
