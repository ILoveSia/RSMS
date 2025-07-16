package org.itcen.domain.submission.repository;

import org.itcen.domain.submission.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
}
