package org.itcen.domain.casestudy.entity;

import lombok.*;
import org.itcen.common.entity.BaseEntity;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;
/**
 * 케이스스터디 Entity
 * SOLID 원칙에 따라 단일 책임만 가지도록 설계
 * DB 테이블 구조와 1:1 매핑
 */
@Entity
@Table(name = "case_study")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseStudy extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "case_study_id")
    private Long caseStudyId;

    @Column(name = "case_study_title", length = 300)
    private String caseStudyTitle;

    @Column(name = "case_study_content", columnDefinition = "TEXT")
    private String caseStudyContent;

    @Column(name = "created_id", length = 100)
    private String createdId;

    @Column(name = "updated_id", length = 100)
    private String updatedId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
