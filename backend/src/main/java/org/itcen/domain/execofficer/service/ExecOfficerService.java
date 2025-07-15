package org.itcen.domain.execofficer.service;

import lombok.RequiredArgsConstructor;
import org.itcen.domain.execofficer.dto.ExecOfficerDto;
import org.itcen.domain.execofficer.entity.ExecOfficer;
import org.itcen.domain.execofficer.repository.ExecOfficerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExecOfficerService {
    private final ExecOfficerRepository repository;

    public List<ExecOfficerDto> getAll() {
        return repository.findAll().stream()
                .map(this::toDto)
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
}