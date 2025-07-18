package org.itcen.domain.submission.entity;

import jakarta.persistence.*;
import lombok.*;
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
}
