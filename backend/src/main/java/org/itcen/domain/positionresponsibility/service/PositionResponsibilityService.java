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

    public List<PositionResponsibilityDto> getByPositionId(Long positionId) {
        String sql = "SELECT p.positions_id, p.positions_nm, r.role_summ, r.responsibility_id, r.created_at, r.updated_at, r2.responsibility_content, r3.responsibility_detail_content, r3.responsibility_mgt_sts, r3.responsibility_rel_evid "
                        + "FROM positions p "
                        + "LEFT JOIN role_resp_status r ON p.positions_id = r.positions_id "
                        + "LEFT JOIN responsibility r2 ON r.responsibility_id = r2.responsibility_id "
                        + "LEFT JOIN responsibility_detail r3 ON r.responsibility_id = r3.responsibility_id "
                        + "WHERE p.positions_id = " + positionId
                        + " ORDER BY p.positions_id";

        List<Object[]> results = em.createNativeQuery(sql).getResultList();
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
                return dto;
            } catch (Exception e) {
                log.error("Error processing row: {}", row, e);
                return null; // Return null for problematic rows
            }
        }).filter(java.util.Objects::nonNull) // Filter out nulls
                .collect(Collectors.toList());

        return finalResult;
    }
    public List<PositionResponsibilityDto> getAll(Long positionsId, Long ledgerOrdersId) {
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append("SELECT p.positions_id, p.positions_nm, r.role_summ, r.responsibility_id, r.created_at, r.updated_at, ")
                .append("r2.responsibility_content, r3.responsibility_detail_content, r3.responsibility_mgt_sts, r3.responsibility_rel_evid, ")
                .append("lo.ledger_orders_id, lo.ledger_orders_title, lo.ledger_orders_status_cd, ")
                .append("a.appr_stat_cd, r.role_resp_status_id ")
                .append("FROM positions p ")
                .append("LEFT JOIN role_resp_status r ON p.positions_id = r.positions_id ")
                .append("LEFT JOIN responsibility r2 ON r.responsibility_id = r2.responsibility_id ")
                .append("LEFT JOIN responsibility_detail r3 ON r.responsibility_id = r3.responsibility_id ")
                .append("LEFT JOIN ledger_orders lo ON p.ledger_order = lo.ledger_orders_id ")
                .append("LEFT JOIN approval a ON r.role_resp_status_id = a.task_id AND a.task_type_cd = 'role_resp_status' ");
        
        // 조건 추가
        boolean hasConditions = false;
        if (positionsId != null) {
            sqlBuilder.append("WHERE p.positions_id = ").append(positionsId);
            hasConditions = true;
        }
        
        if (ledgerOrdersId != null) {
            if (hasConditions) {
                sqlBuilder.append(" AND ");
            } else {
                sqlBuilder.append("WHERE ");
            }
            sqlBuilder.append("lo.ledger_orders_id = ").append(ledgerOrdersId);
        }
        
        sqlBuilder.append(" ORDER BY p.positions_id");
        String sql = sqlBuilder.toString();

        List<Object[]> results = em.createNativeQuery(sql).getResultList();

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
                dto.setLedger_orders_id(row[10] != null ? ((Number) row[10]).longValue() : null);
                dto.setLedger_orders_title(row[11] != null ? (String) row[11] : "");
                dto.setLedger_orders_status_cd(row[12] != null ? (String) row[12] : "");
                dto.setAppr_stat_cd(row[13] != null ? (String) row[13] : ""); // 결재진행상태코드 추가
                dto.setRole_resp_status_id(row[14] != null ? ((Number) row[14]).longValue() : null); // role_resp_status_id 추가
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
        StringBuilder sqlBuilder = new StringBuilder();
        
        // UPDATE 쿼리
        sqlBuilder.append("UPDATE role_resp_status SET ")
                .append("role_summ = '").append(requestDto.getRole_summ()).append("', ")
                .append("updated_id = '").append(requestDto.getUpdated_id()).append("', ")
                .append("updated_at = CURRENT_TIMESTAMP, ")
                .append("responsibility_id = ").append(requestDto.getResponsibility_id());
        
        // ledger_order 필드가 있는 경우에만 추가
        if (requestDto.getLedger_order() != null) {
            sqlBuilder.append(", ledger_order = ").append(requestDto.getLedger_order());
        }
        
        sqlBuilder.append(" WHERE positions_id = ").append(requestDto.getPositions_id()).append("; ");
        
        // INSERT 쿼리
        sqlBuilder.append("INSERT INTO role_resp_status(")
                .append("positions_id, responsibility_id, role_summ, created_id, updated_id, created_at, updated_at");
        
        // ledger_order 필드가 있는 경우에만 추가
        if (requestDto.getLedger_order() != null) {
            sqlBuilder.append(", ledger_order");
        }
        
        sqlBuilder.append(") SELECT ")
                .append(requestDto.getPositions_id()).append(", ")
                .append(requestDto.getResponsibility_id()).append(", '")
                .append(requestDto.getRole_summ()).append("', ")
                .append("'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP");
        
        // ledger_order 값이 있는 경우에만 추가
        if (requestDto.getLedger_order() != null) {
            sqlBuilder.append(", ").append(requestDto.getLedger_order());
        }
        
        sqlBuilder.append(" WHERE NOT EXISTS (")
                .append("SELECT ").append(requestDto.getResponsibility_id())
                .append(" FROM role_resp_status WHERE positions_id = ")
                .append(requestDto.getPositions_id()).append(");");

        String sql = sqlBuilder.toString();
        
        try {
            em.createNativeQuery(sql).executeUpdate();
            return true;
        } catch (Exception e) {
            log.error("Error updating responsibility: {}", e);
            return false;
        }
    }
}
