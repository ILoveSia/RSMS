package org.itcen.domain.execofficer.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.execofficer.dto.ExecOfficerDto;
import org.itcen.domain.execofficer.entity.ExecOfficer;
import org.itcen.domain.execofficer.repository.ExecOfficerRepository;
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
                .append("eo.approval_id, eo.ledger_order, eo.order_status,     em.emp_name ,")
                .append("eo.created_id, eo.updated_id, eo.created_at, eo.updated_at  ")
                .append("FROM positions p  ")
                .append("LEFT JOIN execofficer eo ON p.positions_id = eo.positions_id ")
                .append("left join employee em on eo.emp_id =em.emp_no ");
        
        // ledgerOrdersId 조건 추가
        if (ledgerOrdersId != null) {
            sqlBuilder.append("WHERE eo.ledger_order = ").append(ledgerOrdersId).append(" ");
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
}
