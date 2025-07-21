package org.itcen.domain.positionresponsibility.service;

// import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.itcen.domain.positionresponsibility.dto.PositionResponsibilityDto;
import org.itcen.domain.positionresponsibility.dto.PositionResponsibilityDto.ResponsibilityCreateRequestDto;
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
public class PositionResponsibilityService {

    @PersistenceContext
    private EntityManager em;

    public List<PositionResponsibilityDto> getAll() {
        String sql =
                "SELECT p.positions_id, p.positions_nm, r.role_summ, p.positions_id as responsibility_id, r.created_at, r.updated_at, r2.responsibility_content, r3.responsibility_detail_content, r3.responsibility_mgt_sts, r3.responsibility_rel_evid "
                        + "FROM positions p "
                        + "LEFT JOIN role_resp_status r ON p.positions_id = r.positions_id "
                        + "LEFT JOIN responsibility r2 ON r.responsibility_id = r2.responsibility_id "
                        + "LEFT JOIN responsibility_detail r3 ON r.responsibility_id = r3.responsibility_id "
                        + "ORDER BY p.positions_id";

        log.info("[PositionResponsibilityService] 실행할 SQL: {}", sql);
        List<Object[]> results = em.createNativeQuery(sql).getResultList();
        log.info("[PositionResponsibilityService] 쿼리 결과 개수: {}", results.size());

        // 첫 번째 결과 로그 출력 (디버깅용)
        if (!results.isEmpty()) {
            Object[] firstRow = results.get(0);
            log.info("[PositionResponsibilityService] 첫 번째 행 데이터:");
            for (int i = 0; i < firstRow.length; i++) {
                log.info("  [{}]: {}", i, firstRow[i]);
            }
        }
        List<PositionResponsibilityDto> finalResult = results.stream().map(row -> {
            try {
                PositionResponsibilityDto dto = new PositionResponsibilityDto();
                dto.setPositions_id(row[0] != null ? ((Number) row[0]).longValue() : null);
                dto.setPositions_name(row[1] != null ? (String) row[1] : "");
                dto.setRole_summ(row[2] != null ? (String) row[2] : "");
                dto.setRespontibility_id(row[3] != null ? ((Number) row[3]).longValue() : null);
                dto.setCreated_at(row[4] != null ? (Instant) row[4] : null);
                dto.setUpdated_at(row[5] != null ? (Instant) row[5] : null);
                dto.setResponsibility_conent(row[6] != null ? (String) row[6] : "");
                dto.setResponsibility_detail_content(row[7] != null ? (String) row[7] : "");
                dto.setResponsibility_mgt_sts(row[8] != null ? (String) row[8] : "");
                dto.setResponsibility_rel_evid(row[9] != null ? (String) row[9] : "");
                return dto;
            } catch (Exception e) {
                log.error("Error processing row: {}", row, e);
                return null; // Return null for problematic rows
            }
        }).filter(java.util.Objects::nonNull) // Filter out nulls
                .collect(Collectors.toList());

        return finalResult;
    }

    @Transactional(readOnly = false)
    public boolean updateResponsibility(ResponsibilityCreateRequestDto requestDto) {
        String sql = "UPDATE role_resp_status " + "SET role_summ = '" + requestDto.getRole_summ()
                + "', " + "updated_id = '" + requestDto.getUpdated_id() + "', "
                + "updated_at = CURRENT_TIMESTAMP, " + " responsibility_id= "
                + requestDto.getResponsibility_id() + " WHERE positions_id = "
                + requestDto.getPositions_id() + "; " + "INSERT INTO role_resp_status("
                + "positions_id, responsibility_id, role_summ, created_id, updated_id, created_at, updated_at) "
                + "SELECT " + requestDto.getPositions_id() + ", "
                + requestDto.getResponsibility_id() + ", '" + requestDto.getRole_summ()
                + "', 'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP "
                + "WHERE NOT EXISTS ( " + "SELECT " + requestDto.getResponsibility_id()
                + " FROM role_resp_status WHERE positions_id = " + requestDto.getPositions_id()
                + ");";

        try {
            em.createNativeQuery(sql).executeUpdate();
            return true;
        } catch (Exception e) {
            log.error("Error updating responsibility: {}", e);
            return false;
        }
    }
}
