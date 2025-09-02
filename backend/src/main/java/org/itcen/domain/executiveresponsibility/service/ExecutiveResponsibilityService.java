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

    public List<ExecutiveResponsibilityDto> getByPositionId(Long positionId) {
        String sql = "SELECT   p.positions_id,   p.positions_nm,   e.execofficer_id, " +
                "emp.emp_name,   emp.position_name,   emp.job_title_cd,   emp.num ,r.responsibility_content,rd.responsibility_detail_content, "
                +
                "rd.responsibility_mgt_sts ,rd.responsibility_rel_evid, rrs.role_summ, e.dual_yn, e.dual_details FROM positions p "
                +
                "LEFT JOIN execofficer e ON p.positions_id = e.positions_id " +
                "left join role_resp_status rrs on rrs.positions_id =p.positions_id " +
                "left join responsibility r on r.responsibility_id =rrs.responsibility_id " +
                "left join responsibility_detail rd on rd.responsibility_id =r.responsibility_id " +
                "LEFT JOIN employee emp ON e.emp_id = emp.emp_no " +
                "WHERE p.positions_id = " + positionId +
                " ORDER BY p.positions_id;";
        List<Object[]> results = em.createNativeQuery(sql).getResultList();
        List<ExecutiveResponsibilityDto> finalResult = results.stream().map(row -> {
            try {
                ExecutiveResponsibilityDto dto = new ExecutiveResponsibilityDto();
                dto.setPositionsId(row[0] != null ? ((Number) row[0]).longValue() : null);
                dto.setPositionsNm((String) row[1]);
                dto.setExecofficerId(row[2] != null ? ((Number) row[2]).longValue() : null);
                dto.setEmpName((String) row[3]);
                dto.setPositionName((String) row[4]);  // position_name 설정
                dto.setResponsibilityContent((String) row[7]);
                dto.setResponsibilityDetailContent((String) row[8]);
                dto.setResponsibilityMgtSts((String) row[9]);
                dto.setResponsibilityRelEvid((String) row[10]);
                dto.setRoleSumm((String) row[11]); // role_summ
                dto.setDualYn((String) row[12]); // dual_yn (겸직여부)
                dto.setDualDetails((String) row[13]); // dual_details (겸직사항)
                return dto;
            } catch (Exception e) {
                log.error("Error processing row: {}", row, e);
                return null; // Return null for problematic rows
            }
        }).filter(java.util.Objects::nonNull) // Filter out nulls
                .collect(Collectors.toList());

        return finalResult;
    }

    public List<ExecutiveResponsibilityDto> getAll() {
        String sql = "SELECT " +
                "p.positions_id, " +
                "p.positions_nm, " +
                "e.execofficer_id, " +
                "emp.emp_name, " +
                "emp.position_name, " +
                "r.responsibility_content, " +
                "rd.responsibility_detail_content, " +
                "rd.responsibility_mgt_sts, " +
                "rd.responsibility_rel_evid, " +
                "rrs.role_summ, " +
                "e.dual_yn, " +
                "e.dual_details, " +
                "emp.emp_no, " +
                "e.execofficer_dt " +
                "FROM positions p " +
                "LEFT JOIN execofficer e ON p.positions_id = e.positions_id " +
                "LEFT JOIN role_resp_status rrs ON rrs.positions_id = p.positions_id " +
                "LEFT JOIN responsibility r ON r.responsibility_id = rrs.responsibility_id " +
                "LEFT JOIN responsibility_detail rd ON rd.responsibility_id = r.responsibility_id " +
                "LEFT JOIN employee emp ON e.emp_id = emp.emp_no " +
                "WHERE e.execofficer_id IS NOT NULL " +
                "ORDER BY p.positions_id;";
        
        log.info("Executing SQL query: {}", sql);
        List<Object[]> results = em.createNativeQuery(sql).getResultList();
        log.info("Raw query results count: {}", results.size());
        
        List<ExecutiveResponsibilityDto> finalResult = results.stream().map(row -> {
            try {
                ExecutiveResponsibilityDto dto = new ExecutiveResponsibilityDto();
                dto.setPositionsId(row[0] != null ? ((Number) row[0]).longValue() : null);
                dto.setPositionsNm((String) row[1]);
                dto.setExecofficerId(row[2] != null ? ((Number) row[2]).longValue() : null);
                dto.setEmpName((String) row[3]);
                dto.setPositionName((String) row[4]);  // position_name 설정
                dto.setResponsibilityContent((String) row[5]);
                dto.setResponsibilityDetailContent((String) row[6]);
                dto.setResponsibilityMgtSts((String) row[7]);
                dto.setResponsibilityRelEvid((String) row[8]);
                dto.setRoleSumm((String) row[9]); // role_summ
                dto.setDualYn((String) row[10]); // dual_yn (겸직여부)
                dto.setDualDetails((String) row[11]); // dual_details (겸직사항)
                dto.setEmpNo((String) row[12]); // emp_no
                dto.setExecofficer_dt((String) row[13]); // execofficer_dt
                return dto;
            } catch (Exception e) {
                log.error("Error processing row: {}", row, e);
                return null; // Return null for problematic rows
            }
        }).filter(java.util.Objects::nonNull) // Filter out nulls
                .collect(Collectors.toList());

        log.info("Final result count after processing: {}", finalResult.size());
        return finalResult;
    }
}
