package org.itcen.domain.handover.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import org.itcen.domain.employee.entity.Employee;
import org.itcen.domain.common.entity.Attachment;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 책무기술서 관리 엔티티
 * 직책별 책무기술서 작성 및 관리를 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 책무기술서 정보만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 */
@Entity
@Table(name = "responsibility_documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponsibilityDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;



    /**
     * 문서 제목
     */
    @Column(name = "document_title", length = 200, nullable = false)
    private String documentTitle;

    /**
     * 문서 버전
     */
    @Column(name = "document_version", length = 20)
    @Builder.Default
    private String documentVersion = "1.0";

    /**
     * 문서 내용
     */
    @Column(name = "document_content", columnDefinition = "TEXT")
    private String documentContent;


    /**
     * 승인 ID (approval 테이블 FK)
     */
    @Column(name = "approval_id")
    private Long approvalId;

    /**
     * 시행일
     */
    @Column(name = "effective_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate effectiveDate;

    /**
     * 만료일
     */
    @Column(name = "expiry_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Builder.Default
    private LocalDate expiryDate = LocalDate.of(9999, 12, 31);

    /**
     * 작성자 사번
     */
    @Column(name = "author_emp_no", length = 20)
    private String authorEmpNo;

    /**
     * 작성자 정보 (JOIN)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_emp_no", insertable = false, updatable = false)
    private Employee author;

    /**
     * 첨부파일 목록 (ONE-TO-MANY)
     */
    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "entity_id", referencedColumnName = "document_id", insertable = false, updatable = false)
    @org.hibernate.annotations.Where(clause = "entity_type = 'responsibility_documents' AND deleted_yn = 'N'")
    private List<Attachment> attachments;


    /**
     * 생성일시
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정일시
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 생성자 ID
     */
    @Column(name = "created_id", length = 100)
    private String createdId;

    /**
     * 수정자 ID
     */
    @Column(name = "updated_id", length = 100)
    private String updatedId;

    /**
     * 버전 업데이트
     */
    public void updateVersion(String newVersion) {
        this.documentVersion = newVersion;
    }

    /**
     * 문서가 유효한지 확인
     */
    public boolean isValid() {
        LocalDate now = LocalDate.now();
        return (effectiveDate == null || !now.isBefore(effectiveDate)) &&
               (expiryDate == null || !now.isAfter(expiryDate));
    }
}