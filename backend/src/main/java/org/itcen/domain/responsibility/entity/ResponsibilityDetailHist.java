package org.itcen.domain.responsibility.entity;

import jakarta.persistence.*;
import lombok.*;
import org.itcen.common.entity.BaseTimeEntity;

import java.time.LocalDateTime;

@Entity
@Table(name = "responsibility_detail_hist")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponsibilityDetailHist extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_seq")
    private Long historySeq;

    @Column(name = "history_id", nullable = false)
    private LocalDateTime historyId;

    @Column(name = "responsibility_detail_id", nullable = false)
    private Long responsibilityDetailId;

    @Column(name = "responsibility_id", nullable = false)
    private Long responsibilityId;

    @Column(name = "responsibility_detail_content", columnDefinition = "TEXT")
    private String responsibilityDetailContent;

    @Column(name = "responsibility_mgt_sts", columnDefinition = "TEXT")
    private String responsibilityMgtSts;

    @Column(name = "responsibility_rel_evid", columnDefinition = "TEXT")
    private String responsibilityRelEvid;

    @Column(name = "responsibility_use_yn", nullable = false)
    private String responsibilityUseYn;

    @Column(name = "responsibility_detail_gubun", length = 2)
    private String responsibilityDetailGubun;

    @PrePersist
    public void onPrePersist() {
        this.historyId = LocalDateTime.now();
    }


    public static ResponsibilityDetailHist fromDetail(ResponsibilityDetail detail) {
        return ResponsibilityDetailHist.builder()
                .responsibilityDetailId(detail.getId())
                .responsibilityId(detail.getResponsibility().getId())
                .responsibilityDetailContent(detail.getResponsibilityDetailContent())
                .responsibilityMgtSts(detail.getResponsibilityMgtSts())
                .responsibilityRelEvid(detail.getResponsibilityRelEvid())
                .responsibilityUseYn(detail.getResponsibilityUseYn())
                // .responsibilityDetailGubun("C") // C:Create, U:Update, D:Delete 등.. 정책 필요
                .build();
    }
} 