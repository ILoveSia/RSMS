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
    @Column(name = "submit_id")
    private Long id;

    @Column(name = "history_code", nullable = false)
    private String historyCode;

    @Column(name = "executive_name", nullable = false)
    private String executiveName;

    @Column(name = "position", nullable = false)
    private String position;

    @Column(name = "submission_date", nullable = false)
    private LocalDate submissionDate;

    @Column(name = "attachment_file", nullable = false)
    private String attachmentFile;

    @Column(name = "remarks")
    private String remarks;
    
    // positions 테이블과의 조인을 위한 필드 (실제 FK는 아니지만 조인용)
    @Column(name = "positions_id")
    private Long positionsId;
    
    // positions 테이블과의 연관관계 (LAZY 로딩으로 성능 최적화)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "positions_id", insertable = false, updatable = false)
    private Position positionEntity;
}
