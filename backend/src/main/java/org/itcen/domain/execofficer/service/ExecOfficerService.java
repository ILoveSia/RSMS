package org.itcen.domain.execofficer.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.execofficer.dto.ExecOfficerDto;
import org.itcen.domain.execofficer.dto.ExecutiveAuthResponseDto;
import org.itcen.domain.execofficer.dto.ExecutiveDepartmentInfoDto;
import org.itcen.domain.execofficer.entity.ExecOfficer;
import org.itcen.domain.execofficer.repository.ExecOfficerRepository;
import org.itcen.domain.audit.dto.DeptAuditResultStatusDto;
import org.itcen.domain.audit.dto.DeptImprovementPlanStatusDto;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.math.BigInteger;
import java.time.Instant;
import java.time.LocalDateTime;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExecOfficerService {
    private final ExecOfficerRepository repository;

    @PersistenceContext
    private EntityManager em;

    public List<ExecOfficerDto> getAll(Long ledgerOrdersId) {
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append("SELECT  ")
                .append("p.positions_id, p.positions_nm,  ")
                .append("eo.execofficer_id, eo.emp_id,  eo.execofficer_dt, eo.dual_yn, eo.dual_details,  ")
                .append("eo.approval_id, p.ledger_order, eo.order_status, em.emp_name, ")
                .append("eo.created_id, eo.updated_id, eo.created_at, eo.updated_at, ")
                .append("lo.ledger_orders_status_cd, em.position_name, em.job_rank_cd  ") // position_name, job_rank_cd 추가
                .append("FROM positions p  ")
                .append("LEFT JOIN ledger_orders lo ON p.ledger_order = lo.ledger_orders_id ")
                .append("LEFT JOIN execofficer eo ON p.positions_id = eo.positions_id ")
                .append("LEFT JOIN employee em ON eo.emp_id = em.emp_no ");
        
        // ledgerOrdersId 조건 추가 - positions 테이블의 ledger_order 컬럼으로 조회
        if (ledgerOrdersId != null) {
            sqlBuilder.append("WHERE p.ledger_order = ").append(ledgerOrdersId).append(" ");
        }
        
        sqlBuilder.append("ORDER BY p.positions_id");
        String sql = sqlBuilder.toString();

        List<Object[]> results = em.createNativeQuery(sql).getResultList();

        return results.stream().map(row -> {
            try {
                ExecOfficerDto dto = new ExecOfficerDto();
                dto.setPositionsId(row[0] != null ? ((Number) row[0]).longValue() : null);
                dto.setPositionsNm((String) row[1]);
                dto.setExecofficerId(row[2] != null ? ((Number) row[2]).longValue() : null);
                dto.setEmpId((String) row[3]);
                dto.setExecofficer_dt(row[4] != null ? row[4].toString() : null);
                dto.setDualYn((String) row[5]);
                dto.setDualDetails((String) row[6]);
                dto.setApprovalId(row[7] != null ? ((Number) row[7]).longValue() : null);
                dto.setLedgerOrder(row[8] != null ? ((Number) row[8]).longValue() : null);
                dto.setOrderStatus((String) row[9]);
                dto.setEmpName((String) row[10]);
                dto.setCreatedId((String) row[11]);
                dto.setUpdatedId((String) row[12]);
                dto.setCreatedAt(row[13] != null ? toLocalDateTime(row[13]) : null);
                dto.setUpdatedAt(row[14] != null ? toLocalDateTime(row[14]) : null);
                dto.setLedgerOrdersStatusCd((String) row[15]); // ledger_orders_status_cd 매핑
                dto.setPositionName((String) row[16]); // position_name 매핑
                dto.setJobRankCd((String) row[17]); // job_rank_cd 매핑
                return dto;
            } catch (Exception e) {
                log.error("Error processing row: {}", row, e);
                return null; // Return null for problematic rows
            }
        }).filter(java.util.Objects::nonNull) // Filter out nulls
                .collect(Collectors.toList());
    }

    public ExecOfficerDto getnameById(Long id) {
        ExecOfficer entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("임원을 찾을 수 없습니다."));
        return toDto(entity);
    }

    public ExecOfficerDto create(ExecOfficerDto dto) {
        ExecOfficer entity = toEntity(dto);
        ExecOfficer saved = repository.save(entity);
        return toDto(saved);
    }

    public ExecOfficerDto update(Long id, ExecOfficerDto dto) {
        ExecOfficer entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("임원을 찾을 수 없습니다."));

        // 프론트엔드에서 완벽하게 파싱된 YYYY-MM-DD 형식 날짜를 단순 변환

        entity.setEmpId(dto.getEmpId());
        entity.setExecofficer_dt(dto.getExecofficer_dt());
        entity.setDualYn(dto.getDualYn());
        entity.setDualDetails(dto.getDualDetails());
        entity.setPositionsId(dto.getPositionsId());
        entity.setApprovalId(dto.getApprovalId());
        entity.setLedgerOrder(dto.getLedgerOrder());
        entity.setOrderStatus(dto.getOrderStatus());
        ExecOfficer saved = repository.save(entity);
        return toDto(saved);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    private ExecOfficerDto toDto(ExecOfficer entity) {
        return ExecOfficerDto.builder()
                .execofficerId(entity.getExecofficerId())
                .empId(entity.getEmpId())
                .execofficer_dt(entity.getExecofficer_dt())
                .dualYn(entity.getDualYn())
                .dualDetails(entity.getDualDetails())
                .positionsId(entity.getPositionsId())
                .approvalId(entity.getApprovalId())
                .ledgerOrder(entity.getLedgerOrder())
                .orderStatus(entity.getOrderStatus())
                .createdId(entity.getCreatedId())
                .updatedId(entity.getUpdatedId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private ExecOfficer toEntity(ExecOfficerDto dto) {
        LocalDate execDate = null;
        if (dto.getExecofficer_dt() != null && !dto.getExecofficer_dt().trim().isEmpty()) {
            try {
                // ISO 8601 형식 (2025-07-07T15:00:00.000Z) 처리
                if (dto.getExecofficer_dt().contains("T")) {
                    // ISO 8601 형식에서 날짜 부분만 추출
                    String datePart = dto.getExecofficer_dt().substring(0, 10);
                    execDate = LocalDate.parse(datePart);
                } else {
                    // 기존 YYYY-MM-DD 형식 처리
                    execDate = LocalDate.parse(dto.getExecofficer_dt());
                }
            } catch (Exception e) {
                log.warn("날짜 파싱 실패: {}, 원본 값: {}", e.getMessage(), dto.getExecofficer_dt());
                // 파싱 실패 시 null로 설정
                execDate = null;
            }
        }

        return ExecOfficer.builder()
                .execofficerId(dto.getExecofficerId())
                .empId(dto.getEmpId())
                .execofficer_dt(execDate != null ? execDate.toString() : null)
                .dualYn(dto.getDualYn())
                .dualDetails(dto.getDualDetails())
                .positionsId(dto.getPositionsId())
                .approvalId(dto.getApprovalId())
                .ledgerOrder(dto.getLedgerOrder())
                .orderStatus(dto.getOrderStatus())
                .createdId(dto.getCreatedId())
                .updatedId(dto.getUpdatedId())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value instanceof Timestamp) {
            return ((Timestamp) value).toLocalDateTime();
        } else if (value instanceof Instant) {
            return LocalDateTime.ofInstant((Instant) value, ZoneId.systemDefault());
        } else if (value instanceof LocalDateTime) {
            return (LocalDateTime) value;
        } else if (value != null) {
            // 문자열 등 기타 타입 처리
            return LocalDateTime.parse(value.toString());
        }
        return null;
    }

    // ====== Executive Dashboard API Service Methods ======

    /**
     * 임원 권한 확인
     * execofficer 테이블에서 해당 사용자가 임원인지 확인하고,
     * ledger_order의 최대값을 가진 임원인지 확인
     */
    public ExecutiveAuthResponseDto checkExecutiveAuth(String empId) {
        log.debug("임원 권한 확인 시작: empId={}", empId);

        String sql = """
            SELECT 
                eo.execofficer_id,
                eo.emp_id,
                eo.positions_id,
                p.positions_nm,
                p.ledger_order,
                CASE WHEN p.ledger_order = (
                    SELECT MAX(p2.ledger_order) 
                    FROM positions p2 
                    JOIN execofficer eo2 ON p2.positions_id = eo2.positions_id
                    WHERE eo2.emp_id = eo.emp_id
                ) THEN true ELSE false END as is_max_order
            FROM execofficer eo
            JOIN positions p ON eo.positions_id = p.positions_id
            WHERE eo.emp_id = :empId
            ORDER BY p.ledger_order DESC
            LIMIT 1
            """;

        try {
            List<Object[]> results = em.createNativeQuery(sql)
                    .setParameter("empId", empId)
                    .getResultList();

            if (results.isEmpty()) {
                // 임원이 아닌 경우
                return ExecutiveAuthResponseDto.builder()
                        .isExecutive(false)
                        .empId(empId)
                        .departmentCount(0)
                        .build();
            }

            Object[] row = results.get(0);
            Long execofficerId = row[0] != null ? ((Number) row[0]).longValue() : null;
            Long positionsId = row[2] != null ? ((Number) row[2]).longValue() : null;
            String positionsName = (String) row[3];
            Long ledgerOrder = row[4] != null ? ((Number) row[4]).longValue() : null;
            Boolean isMaxOrder = (Boolean) row[5];

            // 소관부서 수 조회
            Integer departmentCount = getDepartmentCount(empId);

            log.debug("임원 권한 확인 완료: execofficerId={}, positionsId={}, ledgerOrder={}, isMaxOrder={}, departmentCount={}", 
                    execofficerId, positionsId, ledgerOrder, isMaxOrder, departmentCount);

            return ExecutiveAuthResponseDto.builder()
                    .isExecutive(true)
                    .execofficerId(execofficerId)
                    .empId(empId)
                    .positionsId(positionsId)
                    .positionsName(positionsName)
                    .ledgerOrder(ledgerOrder)
                    .departmentCount(departmentCount)
                    .build();

        } catch (Exception e) {
            log.error("임원 권한 확인 중 오류 발생: empId={}", empId, e);
            return ExecutiveAuthResponseDto.builder()
                    .isExecutive(false)
                    .empId(empId)
                    .departmentCount(0)
                    .build();
        }
    }

    /**
     * 임원 소관부서 목록 조회
     * positions_owner_dept 테이블을 통해 소관부서 목록 조회
     */
    public List<ExecutiveDepartmentInfoDto> getExecutiveDepartments(String empId) {
        log.debug("임원 소관부서 조회 시작: empId={}", empId);

        String sql = """
            SELECT DISTINCT
                pod.owner_dept_cd,
                d.department_name,
                pod.owner_dept_cd,
                p.positions_id,
                p.positions_nm
            FROM positions_owner_dept pod
            JOIN execofficer eo ON pod.positions_id = eo.positions_id
            JOIN positions p ON eo.positions_id = p.positions_id
            LEFT JOIN departments d ON pod.owner_dept_cd = d.department_id
            WHERE eo.emp_id = :empId
            ORDER BY pod.owner_dept_cd
            """;

        try {
            List<Object[]> results = em.createNativeQuery(sql)
                    .setParameter("empId", empId)
                    .getResultList();

            List<ExecutiveDepartmentInfoDto> departments = results.stream()
                    .map(row -> ExecutiveDepartmentInfoDto.builder()
                            .deptCd((String) row[0])
                            .deptName((String) row[1])
                            .ownerDeptCd((String) row[2])
                            .positionsId(row[3] != null ? ((Number) row[3]).longValue() : null)
                            .positionsName((String) row[4])
                            .build())
                    .collect(Collectors.toList());

            log.debug("임원 소관부서 조회 완료: empId={}, 부서수={}", empId, departments.size());
            return departments;

        } catch (Exception e) {
            log.error("임원 소관부서 조회 중 오류 발생: empId={}", empId, e);
            return List.of();
        }
    }

    /**
     * 임원 소관부서별 점검결과 현황 조회
     */
    public List<DeptAuditResultStatusDto> getExecutiveAuditResultStatus(String empId, Long ledgerOrdersHodId) {
        log.debug("임원 소관부서 점검결과 현황 조회 시작: empId={}, ledgerOrdersHodId={}", empId, ledgerOrdersHodId);

        String sql = """
            SELECT 
                hici.dept_cd,
                COALESCE(d.department_name, hici.dept_cd) as dept_name,
                COUNT(hici.hod_ic_item_id) as total_count,
                SUM(CASE WHEN apmd.audit_result_status_cd = 'INS02' THEN 1 ELSE 0 END) as appropriate_count,
                SUM(CASE WHEN apmd.audit_result_status_cd = 'INS03' THEN 1 ELSE 0 END) as inadequate_count,
                SUM(CASE WHEN apmd.audit_result_status_cd = 'INS04' THEN 1 ELSE 0 END) as excluded_count,
                ROUND(
                    CASE WHEN COUNT(hici.hod_ic_item_id) > 0
                    THEN (SUM(CASE WHEN apmd.audit_result_status_cd = 'INS02' THEN 1 ELSE 0 END)::decimal / COUNT(hici.hod_ic_item_id)) * 100
                    ELSE 0 END, 1
                ) as appropriate_rate,
                arr.audit_result_report_id,
                apm.audit_prog_mngt_id
            FROM audit_prog_mngt_detail apmd
            JOIN audit_prog_mngt apm ON apmd.audit_prog_mngt_id = apm.audit_prog_mngt_id
            LEFT JOIN hod_ic_item hici ON apmd.hod_ic_item_id = hici.hod_ic_item_id
            LEFT JOIN departments d ON hici.dept_cd = d.department_id
            LEFT JOIN audit_result_report arr ON apmd.audit_prog_mngt_id = arr.audit_prog_mngt_id
            WHERE hici.dept_cd IN (
                SELECT pod.owner_dept_cd 
                FROM positions_owner_dept pod
                JOIN execofficer eo ON pod.positions_id = eo.positions_id
                WHERE eo.emp_id = :empId
            )
            """;

        if (ledgerOrdersHodId != null) {
            sql += " AND apm.ledger_orders_hod = :ledgerOrdersHodId ";
        }

        sql += """
            GROUP BY hici.dept_cd, d.department_name, arr.audit_result_report_id, apm.audit_prog_mngt_id
            ORDER BY hici.dept_cd
            """;

        try {
            var query = em.createNativeQuery(sql)
                    .setParameter("empId", empId);

            if (ledgerOrdersHodId != null) {
                query.setParameter("ledgerOrdersHodId", ledgerOrdersHodId);
            }

            List<Object[]> results = query.getResultList();

            List<DeptAuditResultStatusDto> statusList = results.stream()
                    .map(row -> {
                        DeptAuditResultStatusDto dto = new DeptAuditResultStatusDto();
                        dto.setDeptCd((String) row[0]);
                        dto.setDeptName((String) row[1]);
                        dto.setTotalCount(row[2] != null ? ((Number) row[2]).longValue() : 0L);
                        dto.setAppropriateCount(row[3] != null ? ((Number) row[3]).longValue() : 0L);
                        dto.setInadequateCount(row[4] != null ? ((Number) row[4]).longValue() : 0L);
                        dto.setExcludedCount(row[5] != null ? ((Number) row[5]).longValue() : 0L);
                        dto.setAppropriateRate(row[6] != null ? ((Number) row[6]).doubleValue() : 0.0);
                        dto.setAuditResultReportId(row[7] != null ? ((Number) row[7]).longValue() : null);
                        dto.setAuditProgMngtId(row[8] != null ? ((Number) row[8]).longValue() : null);
                        return dto;
                    })
                    .collect(Collectors.toList());

            log.debug("임원 소관부서 점검결과 현황 조회 완료: empId={}, 결과수={}", empId, statusList.size());
            return statusList;

        } catch (Exception e) {
            log.error("임원 소관부서 점검결과 현황 조회 중 오류 발생: empId={}, ledgerOrdersHodId={}", empId, ledgerOrdersHodId, e);
            return List.of();
        }
    }

    /**
     * 임원 소관부서별 개선계획 이행 현황 조회
     */
    public List<DeptImprovementPlanStatusDto> getExecutiveImprovementPlanStatus(String empId, Long ledgerOrdersHodId) {
        log.debug("임원 소관부서 개선계획 이행 현황 조회 시작: empId={}, ledgerOrdersHodId={}", empId, ledgerOrdersHodId);

        String sql = """
            SELECT 
                hici.dept_cd,
                COALESCE(d.department_name, hici.dept_cd) as dept_name,
                COUNT(CASE WHEN apmd.audit_result_status_cd = 'INS03' THEN 1 END) as inadequate_count,
                COUNT(CASE WHEN apmd.audit_result_status_cd = 'INS03' AND apmd.imp_pl_status_cd = 'PLI01' THEN 1 END) as plan_created_count,
                COUNT(CASE WHEN apmd.audit_result_status_cd = 'INS03' AND apmd.imp_pl_status_cd = 'PLI02' THEN 1 END) as result_written_count,
                COUNT(CASE WHEN apmd.audit_result_status_cd = 'INS03' AND (apmd.imp_pl_status_cd = 'PLI03' OR apmd.audit_final_result_yn = 'Y') THEN 1 END) as result_approved_count,
                ROUND(
                    CASE WHEN COUNT(CASE WHEN apmd.audit_result_status_cd = 'INS03' THEN 1 END) > 0
                    THEN (COUNT(CASE WHEN apmd.audit_result_status_cd = 'INS03' AND (apmd.imp_pl_status_cd = 'PLI03' OR apmd.audit_final_result_yn = 'Y') THEN 1 END)::decimal / COUNT(CASE WHEN apmd.audit_result_status_cd = 'INS03' THEN 1 END)) * 100
                    ELSE 0 END, 1
                ) as completion_rate,
                arr.audit_result_report_id,
                apm.audit_prog_mngt_id
            FROM audit_prog_mngt_detail apmd
            JOIN audit_prog_mngt apm ON apmd.audit_prog_mngt_id = apm.audit_prog_mngt_id
            LEFT JOIN hod_ic_item hici ON apmd.hod_ic_item_id = hici.hod_ic_item_id
            LEFT JOIN departments d ON hici.dept_cd = d.department_id
            LEFT JOIN audit_result_report arr ON apmd.audit_prog_mngt_id = arr.audit_prog_mngt_id AND hici.dept_cd = arr.dept_cd
            LEFT JOIN approval a ON arr.audit_result_report_id = a.task_id AND a.task_type_cd = 'audit_result_report'
            WHERE hici.dept_cd IN (
                SELECT pod.owner_dept_cd 
                FROM positions_owner_dept pod
                JOIN execofficer eo ON pod.positions_id = eo.positions_id
                WHERE eo.emp_id = :empId
            )
            """;

        if (ledgerOrdersHodId != null) {
            sql += " AND apm.ledger_orders_hod = :ledgerOrdersHodId ";
        }

        sql += """
            GROUP BY hici.dept_cd, d.department_name, arr.audit_result_report_id, apm.audit_prog_mngt_id
            ORDER BY hici.dept_cd
            """;

        try {
            var query = em.createNativeQuery(sql)
                    .setParameter("empId", empId);

            if (ledgerOrdersHodId != null) {
                query.setParameter("ledgerOrdersHodId", ledgerOrdersHodId);
            }

            List<Object[]> results = query.getResultList();

            List<DeptImprovementPlanStatusDto> statusList = results.stream()
                    .map(row -> {
                        DeptImprovementPlanStatusDto dto = new DeptImprovementPlanStatusDto();
                        dto.setDeptCd((String) row[0]);
                        dto.setDeptName((String) row[1]);
                        dto.setInadequateCount(row[2] != null ? ((Number) row[2]).longValue() : 0L); // inadequate_count 추가
                        dto.setPlanCreatedCount(row[3] != null ? ((Number) row[3]).longValue() : 0L);
                        dto.setResultWrittenCount(row[4] != null ? ((Number) row[4]).longValue() : 0L);
                        dto.setResultApprovedCount(row[5] != null ? ((Number) row[5]).longValue() : 0L);
                        dto.setCompletionRate(row[6] != null ? ((Number) row[6]).doubleValue() : 0.0);
                        dto.setAuditResultReportId(row[7] != null ? ((Number) row[7]).longValue() : null);
                        dto.setAuditProgMngtId(row[8] != null ? ((Number) row[8]).longValue() : null);
                        return dto;
                    })
                    .collect(Collectors.toList());

            log.debug("임원 소관부서 개선계획 이행 현황 조회 완료: empId={}, 결과수={}", empId, statusList.size());
            return statusList;

        } catch (Exception e) {
            log.error("임원 소관부서 개선계획 이행 현황 조회 중 오류 발생: empId={}, ledgerOrdersHodId={}", empId, ledgerOrdersHodId, e);
            return List.of();
        }
    }

    /**
     * 소관부서 수 조회 (헬퍼 메서드)
     */
    private Integer getDepartmentCount(String empId) {
        String sql = """
            SELECT COUNT(DISTINCT pod.owner_dept_cd)
            FROM positions_owner_dept pod
            JOIN execofficer eo ON pod.positions_id = eo.positions_id
            WHERE eo.emp_id = :empId
            """;

        try {
            Number result = (Number) em.createNativeQuery(sql)
                    .setParameter("empId", empId)
                    .getSingleResult();
            return result != null ? result.intValue() : 0;
        } catch (Exception e) {
            log.warn("소관부서 수 조회 실패: empId={}", empId, e);
            return 0;
        }
    }
}
