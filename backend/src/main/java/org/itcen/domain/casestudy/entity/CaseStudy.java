package org.itcen.domain.casestudy.entity;

import lombok.*;
import org.itcen.common.entity.BaseEntity;
import jakarta.persistence.*;

/**
 * 케이스스터디 Entity
 * SOLID 원칙에 따라 단일 책임만 가지도록 설계
 * DB 테이블 구조와 1:1 매핑
 * 
 * BaseEntity에서 상속받는 필드들:
 * - createdAt, updatedAt, createdId, updatedId
 */
@Entity
@Table(name = "case_study")
@Getter
@Setter
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

    // BaseEntity에서 상속받으므로 중복 정의 제거:
    // - createdId, updatedId, createdAt, updatedAt
}
