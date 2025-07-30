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
    String sql="SELECT   p.positions_id,   p.positions_nm,   e.execofficer_id, "+
                 	"emp.emp_name,   emp.job_rank_cd,   emp.job_title_cd,   emp.num ,r.responsibility_content,rd.responsibility_detail_content, "+
                 	"rd.responsibility_mgt_sts ,rd.responsibility_rel_evid, rrs.role_summ, e.dual_yn, e.dual_details FROM positions p "+
                 "LEFT JOIN execofficer e ON p.positions_id = e.positions_id "+
                 "left join role_resp_status rrs on rrs.positions_id =p.positions_id "+
                 "left join responsibility r on r.responsibility_id =rrs.responsibility_id "+
                 "left join responsibility_detail rd on rd.responsibility_id =r.responsibility_id "+
                 "LEFT JOIN employee emp ON e.emp_id = emp.emp_no "+
                 "WHERE p.positions_id = " + positionId +
                 " ORDER BY p.positions_id;";
    List<Object[]> results = em.createNativeQuery(sql).getResultList();
        List<ExecutiveResponsibilityDto> finalResult = results.stream().map(row -> {
            try {
                ExecutiveResponsibilityDto dto = new ExecutiveResponsibilityDto();
                dto.setPositionsId(row[0] != null ? ((Number) row[0]).longValue() : null);
                dto.setPositionNameMapped((String) row[1]);
                dto.setExecofficerId(row[2] != null ? ((Number) row[2]).longValue() : null);
                dto.setEmpName((String) row[3]);
                dto.setJobRankCd((String) row[4]);
                dto.setJobTitleCd((String) row[5]);
                dto.setNum((String) row[6]);
                dto.setResponsibilityContent((String) row[7]);
                dto.setResponsibilityDetailContent((String) row[8]);
                dto.setResponsibilityMgtSts((String) row[9]);
                dto.setResponsibilityRelEvid((String) row[10]);
                dto.setRoleSumm((String) row[11]); // role_summ 추가
                dto.setHasConcurrentPosition((String) row[12]); // 겸직여부 추가
                dto.setConcurrentPosition((String) row[13]); // 겸직사항 추가
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
        String sql = "select "+
	"p.positions_id,"+
	"p.positions_nm,"+
	"e.execofficer_id,"+
	"emp.emp_name,"+
	"emp.job_rank_cd,"+
	"emp.job_title_cd,"+
	"emp.num,"+
	"r.responsibility_content,"+
	"rd.responsibility_detail_content,"+
	"rd.responsibility_mgt_sts ,"+
	"rd.responsibility_rel_evid ,"+
	"e.execofficer_dt,"+
	"rrs.role_summ,"+
	"e.dual_yn ,"+
	"e.dual_details "+
	"from positions p "+
	"left join execofficer e on "+
	"p.positions_id = e.positions_id "+
	"left join role_resp_status rrs on "+
	"rrs.positions_id = p.positions_id "+
	"left join responsibility r on "+
	"r.responsibility_id = rrs.responsibility_id "+
	"left join responsibility_detail rd on "+
	"rd.responsibility_id = r.responsibility_id "+
	"left join employee emp on "+
	"e.emp_id = emp.emp_no "+
	"order by "+
	"p.positions_id;";
        List<Object[]> results = em.createNativeQuery(sql).getResultList();
        List<ExecutiveResponsibilityDto> finalResult = results.stream().map(row -> {
            try {
                ExecutiveResponsibilityDto dto = new ExecutiveResponsibilityDto();
                dto.setPositionsId(row[0] != null ? ((Number) row[0]).longValue() : null);
                dto.setPositionNameMapped((String) row[1]);
                dto.setExecofficerId(row[2] != null ? ((Number) row[2]).longValue() : null);
                dto.setEmpName((String) row[3]);
                dto.setJobRankCd((String) row[4]);
                dto.setJobTitleCd((String) row[5]);
                dto.setNum((String) row[6]);
                dto.setResponsibilityContent((String) row[7]);
                dto.setResponsibilityDetailContent((String) row[8]);
                dto.setResponsibilityMgtSts((String) row[9]);
                dto.setResponsibilityRelEvid((String) row[10]);
                dto.setExecofficer_dt((String) row[11]);
                dto.setRoleSumm((String) row[12]); // role_summ 추가
                dto.setHasConcurrentPosition((String) row[13]); // 겸직여부 추가
                dto.setConcurrentPosition((String) row[14]); // 겸직사항 추가
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
