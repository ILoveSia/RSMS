package org.itcen.domain.executiveresponsibility.service;

import java.util.List;
import java.util.stream.Collectors;
import org.itcen.domain.executiveresponsibility.dto.ExecutiveResponsibilityDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;

/**
 * 임원별 책무 현황 서비스
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class ExecutiveResponsibilityService {

    @PersistenceContext
    private EntityManager em;

    public List<ExecutiveResponsibilityDto> getAll() {
        String sql = "SELECT " + "p.positions_id, " + "p.positions_nm, " + "e.execofficer_id, "
                + "u.username, " + "u.job_rank_cd, " + "u.job_title_cd " + "FROM positions p "
                + "LEFT JOIN execofficer e ON p.positions_id = e.positions_id "
                + "LEFT JOIN users u ON e.emp_id = u.id " + "ORDER BY p.positions_id";
        List<Object[]> results = em.createNativeQuery(sql).getResultList();
        List<ExecutiveResponsibilityDto> finalResult = results.stream().map(row -> {
            try {
                ExecutiveResponsibilityDto dto = new ExecutiveResponsibilityDto();
                dto.setPositionsId(row[0] != null ? ((Number) row[0]).longValue() : null);
                dto.setPositionNameMapped((String) row[1]);
                dto.setExecofficerId(row[2] != null ? ((Number) row[2]).longValue() : null);
                dto.setEmpId((String) row[3]);
                dto.setJobRankCd((String) row[4]);
                dto.setJobTitleCd((String) row[5]);
                return dto;
            } catch (Exception e) {
                log.error("Error processing row: {}", row, e);
                return null; // Return null for problematic rows
            }
        }).filter(java.util.Objects::nonNull) // Filter out nulls
                .collect(Collectors.toList());

        return finalResult;
    }
}
