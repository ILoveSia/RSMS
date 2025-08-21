package org.itcen.domain.submissionreport.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "submission_reports")
@Getter
@Setter
public class SubmissionReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "submission_report_id")
    private Long submissionReportId;

    @Column(name = "base_date", nullable = false)
    private LocalDate baseDate;

    @Column(name = "target_institution", nullable = false)
    private String targetInstitution;

    @Column(name = "use_yn", nullable = false)
    private Boolean useYn = true; // Default to true, as per common practice

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private String createdBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;
}
