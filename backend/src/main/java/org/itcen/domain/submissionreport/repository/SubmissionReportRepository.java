package org.itcen.domain.submissionreport.repository;

import org.itcen.domain.submissionreport.entity.SubmissionReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubmissionReportRepository extends JpaRepository<SubmissionReport, Long> {
}
