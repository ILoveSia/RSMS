package org.itcen.domain.execofficer.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExecOfficerDto {
    private Long execofficerId;
    private String empId;
    private String execofficerDt;
    private String dualYn;
    private String dualDetails;
    private Long positionsId;
    private Long approvalId;
    private String ledgerOrder;
    private String orderStatus;
    private String createdId;
    private String updatedId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String positionNameMapped;
    private String userName;
}
