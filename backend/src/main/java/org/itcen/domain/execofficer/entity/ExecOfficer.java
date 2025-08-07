package org.itcen.domain.execofficer.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "execofficer")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExecOfficer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "execofficer_id")
    private Long execofficerId;

    @Column(name = "emp_id", nullable = false)
    private String empId;
    
    @Column(name = "execofficer_dt")
    private String execofficer_dt;

    @Column(name = "dual_yn")
    private String dualYn;

    @Column(name = "dual_details")
    private String dualDetails;

    @Column(name = "positions_id", nullable = false)
    private Long positionsId;

    @Column(name = "approval_id")
    private Long approvalId;

    @Column(name = "ledger_order")
    private Long ledgerOrder;

    @Column(name = "order_status")
    private String orderStatus;

    @Column(name = "created_id")
    private String createdId;

    @Column(name = "updated_id")
    private String updatedId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}