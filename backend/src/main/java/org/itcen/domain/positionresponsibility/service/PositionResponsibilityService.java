package org.itcen.domain.positionresponsibility.service;

import java.util.List;
import java.util.stream.Collectors;
import org.itcen.domain.positionresponsibility.dto.PositionResponsibilityDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
// import java.sql.Timestamp;
import java.time.Instant;

/**
 * 임원별 책무 현황 서비스
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class PositionResponsibilityService {

    @PersistenceContext
    private EntityManager em;

    public List<PositionResponsibilityDto> getAll() {
        String sql =
                "SELECT p.positions_id, p.positions_nm, r.role_summ, r.responsibility_id, r.created_at, r.updated_at, r2.responsibility_content, r3.responsibility_detail_content "
                        + "FROM positions p "
                        + "LEFT JOIN role_resp_status r ON p.positions_id = r.positions_id "
                        + "LEFT JOIN responsibility r2 ON r.responsibility_id = r2.responsibility_id "
                        + "LEFT JOIN responsibility_detail r3 ON r.responsibility_id = r3.responsibility_id "
                        + "ORDER BY p.positions_id";

        log.info("[PositionResponsibilityService] 실행할 SQL: {}", sql);
        List<Object[]> results = em.createNativeQuery(sql).getResultList();
        List<PositionResponsibilityDto> finalResult = results.stream().map(row -> {
            try {
                PositionResponsibilityDto dto = new PositionResponsibilityDto();
                log.info("row[0]: {}", row[0]);
                log.info("row[1]: {}", row[1]);
                log.info("row[2]: {}", row[2]);
                log.info("row[3]: {}", row[3]);
                log.info("row[4]: {}", row[4]);
                log.info("row[5]: {}", row[5]);
                log.info("row[6]: {}", row[6]);
                log.info("row[7]: {}", row[7]);
                dto.setPositions_id(row[0] != null ? ((Number) row[0]).longValue() : null);
                dto.setPositions_name(row[1] != null ? (String) row[1] : "");
                dto.setRole_summ(row[2] != null ? (String) row[2] : "");
                dto.setRespontibility_id(row[3] != null ? ((Number) row[3]).longValue() : null);
                dto.setCreated_at(row[4] != null ? (Instant) row[4] : null);
                dto.setUpdated_at(row[5] != null ? (Instant) row[5] : null);
                dto.setResponsibility_conent(row[6] != null ? (String) row[6] : "");
                dto.setResponsibility_detail_content(row[7] != null ? (String) row[7] : "");
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
