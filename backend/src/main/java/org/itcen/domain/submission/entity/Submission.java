package org.itcen.domain.submission.entity;

import jakarta.persistence.*;
import lombok.*;
import org.itcen.domain.positions.entity.Position;
import java.time.LocalDate;

@Entity
@Table(name = "rm_submit_mgmt")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rm_submit_mgmt_id")
    private Long id;

    @Column(name = "submit_hist_cd", nullable = false)
    private String submitHistCd;

    @Column(name = "execofficer_id", nullable = false, length = 100)
    private String execofficerId;

    @Column(name = "rm_submit_dt")
    private LocalDate rmSubmitDt;

    @Column(name = "update_yn", length = 1)
    private String updateYn = "N";

    @Column(name = "rm_submit_remarks", length = 1000)
    private String rmSubmitRemarks;
    
    @Column(name = "positions_id")
    private Long positionsId;
    
    @Column(name = "created_id", length = 100)
    private String createdId;
    
    @Column(name = "updated_id", length = 100)
    private String updatedId;
    
    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
    
    @Column(name = "bank_cd", length = 100)
    private String bankCd;
    
    // positions 테이블과의 연관관계 (LAZY 로딩으로 성능 최적화)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "positions_id", insertable = false, updatable = false)
    private Position positionEntity;
}
