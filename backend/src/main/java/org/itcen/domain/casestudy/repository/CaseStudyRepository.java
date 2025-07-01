package org.itcen.domain.casestudy.repository;

import org.itcen.domain.casestudy.entity.CaseStudy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * CaseStudy 데이터 접근 책임만 가짐
 */
@Repository
public interface CaseStudyRepository extends JpaRepository<CaseStudy, Long> {
    // 필요시 커스텀 쿼리 추가
}