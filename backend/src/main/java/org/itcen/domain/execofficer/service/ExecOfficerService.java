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

    public List<ExecOfficerDto> getAll() {
        String sql = "SELECT  " +
                     "p.positions_id, p.positions_nm,  " +
                     "eo.execofficer_id, eo.emp_id,  eo.execofficer_dt, eo.dual_yn, eo.dual_details,  " +
                     "eo.approval_id, eo.ledger_order, eo.order_status,  " +
                     "eo.created_id, eo.updated_id, eo.created_at, eo.updated_at  " +
                     "FROM positions p  " +
                     "LEFT JOIN execofficer eo ON p.positions_id = eo.positions_id " +
                     "ORDER BY p.positions_id";

        List<Object[]> results = em.createNativeQuery(sql).getResultList();

        return results.stream().map(row -> {
            try {
                ExecOfficerDto dto = new ExecOfficerDto();
                dto.setPositionsId(row[0] != null ? ((Number) row[0]).longValue() : null);
                dto.setPositionNameMapped((String) row[1]);
                dto.setExecofficerId(row[2] != null ? ((Number) row[2]).longValue() : null);
                dto.setEmpId((String) row[3]);
                dto.setExecofficerDt((String) row[4]);
                dto.setDualYn((String) row[5]);
                dto.setDualDetails((String) row[6]);
                dto.setApprovalId(row[7] != null ? ((Number) row[7]).longValue() : null);
                dto.setLedgerOrder((String) row[8]);
                dto.setOrderStatus((String) row[9]);
                dto.setCreatedId((String) row[10]);
                dto.setUpdatedId((String) row[11]);
                dto.setCreatedAt(row[12] != null ? toLocalDateTime(row[12]) : null);
                dto.setUpdatedAt(row[13] != null ? toLocalDateTime(row[13]) : null);
                return dto;
            } catch (Exception e) {
                log.error("Error processing row: {}", row, e);
                return null; // Return null for problematic rows
            }
        }).filter(java.util.Objects::nonNull) // Filter out nulls
        .collect(Collectors.toList());
    }

    public ExecOfficerDto create(ExecOfficerDto dto) {
        ExecOfficer entity = toEntity(dto);
        ExecOfficer saved = repository.save(entity);
        return toDto(saved);
    }

    public ExecOfficerDto update(Long id, ExecOfficerDto dto) {
        ExecOfficer entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("임원을 찾을 수 없습니다."));
        entity.setEmpId(dto.getEmpId());
        entity.setExecofficerDt(dto.getExecofficerDt());
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
                .execofficerDt(entity.getExecofficerDt())
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
        return ExecOfficer.builder()
                .execofficerId(dto.getExecofficerId())
                .empId(dto.getEmpId())
                .execofficerDt(dto.getExecofficerDt())
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
