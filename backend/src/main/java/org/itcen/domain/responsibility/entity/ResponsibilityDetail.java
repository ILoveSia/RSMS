package org.itcen.domain.responsibility.entity;

import jakarta.persistence.*;
import lombok.*;
import org.itcen.common.entity.BaseTimeEntity;

@Entity
@Table(name = "responsibility_detail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponsibilityDetail extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "responsibility_detail_id")
    private Long responsibilityDetailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsibility_id", nullable = false)
    private Responsibility responsibility;

    @Column(name = "responsibility_detail_content", columnDefinition = "TEXT")
    private String responsibilityDetailContent;

    @Column(name = "responsibility_mgt_sts", columnDefinition = "TEXT")
    private String responsibilityMgtSts;

    @Column(name = "responsibility_rel_evid", columnDefinition = "TEXT")
    private String responsibilityRelEvid;

    @Column(name = "responsibility_use_yn", nullable = false)
    private String responsibilityUseYn;

    @PrePersist
    public void prePersist() {
        this.responsibilityUseYn = (this.responsibilityUseYn == null) ? "Y" : this.responsibilityUseYn;
    }
} 