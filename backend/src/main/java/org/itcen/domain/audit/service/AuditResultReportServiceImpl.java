package org.itcen.domain.audit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.audit.dto.AuditResultReportDto;
import org.itcen.domain.audit.entity.AuditResultReport;
import org.itcen.domain.audit.repository.AuditResultReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 점검결과보고 Service 구현체
 * 
 * 단일 책임 원칙(SRP): 점검결과보고 비즈니스 로직만 담당
 * 의존성 역전 원칙(DIP): Repository 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditResultReportServiceImpl implements AuditResultReportService {

    private final AuditResultReportRepository auditResultReportRepository;

    /**
     * 점검결과보고서 등록
     */
    @Override
    @Transactional
    public AuditResultReportDto createAuditResultReport(AuditResultReportDto dto) {
        log.debug("점검결과보고서 등록 시작: {}", dto);

        // 중복 체크 (같은 점검계획관리ID와 부서코드로 이미 등록된 보고서가 있는지 확인)
        auditResultReportRepository.findByAuditProgMngtIdAndDeptCd(dto.getAuditProgMngtId(), dto.getDeptCd())
                .ifPresent(existing -> {
                    throw new RuntimeException("해당 점검계획에 대한 부서별 결과보고서가 이미 존재합니다.");
                });

        // Entity 생성 및 저장
        AuditResultReport entity = AuditResultReport.builder()
                .auditProgMngtId(dto.getAuditProgMngtId())
                .deptCd(dto.getDeptCd())
                .empNo(dto.getEmpNo())
                .auditResultContent(dto.getAuditResultContent())
                .empNo01(dto.getEmpNo01())
                .auditResultContent01(dto.getAuditResultContent01())
                .empNo02(dto.getEmpNo02())
                .auditResultContent02(dto.getAuditResultContent02())
                .reqMemo(dto.getReqMemo())
                .build();

        AuditResultReport savedEntity = auditResultReportRepository.save(entity);

        log.debug("점검결과보고서 등록 완료: {}", savedEntity.getAuditResultReportId());
        return convertToDto(savedEntity);
    }

    /**
     * 점검결과보고서 수정
     */
    @Override
    @Transactional
    public AuditResultReportDto updateAuditResultReport(AuditResultReportDto dto) {
        log.debug("점검결과보고서 수정 시작: {}", dto.getAuditResultReportId());

        AuditResultReport entity = auditResultReportRepository.findById(dto.getAuditResultReportId())
                .orElseThrow(() -> new RuntimeException("점검결과보고서를 찾을 수 없습니다: " + dto.getAuditResultReportId()));

        // 데이터 수정
        entity.updateAuditResultContent(dto.getAuditResultContent());
        entity.updateReqMemo(dto.getReqMemo());
        entity.updateApprover01(dto.getEmpNo01(), dto.getAuditResultContent01());
        entity.updateApprover02(dto.getEmpNo02(), dto.getAuditResultContent02());

        AuditResultReport savedEntity = auditResultReportRepository.save(entity);

        log.debug("점검결과보고서 수정 완료: {}", savedEntity.getAuditResultReportId());
        return convertToDto(savedEntity);
    }

    /**
     * 점검결과보고서 상세 조회
     */
    @Override
    public AuditResultReportDto getAuditResultReport(Long auditResultReportId) {
        log.debug("점검결과보고서 상세 조회: {}", auditResultReportId);

        // Native Query를 사용하여 조인 정보 포함 조회
        List<Object[]> nativeResults = auditResultReportRepository.findAuditResultReportDetailNative(auditResultReportId);
        
        if (nativeResults.isEmpty()) {
            throw new RuntimeException("점검결과보고서를 찾을 수 없습니다: " + auditResultReportId);
        }

        return convertObjectArrayToDto(nativeResults.get(0));
    }

    /**
     * 점검계획관리ID로 결과보고서 조회
     */
    @Override
    public AuditResultReportDto getAuditResultReportByAuditProgMngtId(Long auditProgMngtId) {
        log.debug("점검계획관리ID로 결과보고서 조회: {}", auditProgMngtId);

        AuditResultReport entity = auditResultReportRepository.findByAuditProgMngtId(auditProgMngtId)
                .orElseThrow(() -> new RuntimeException("점검결과보고서를 찾을 수 없습니다: " + auditProgMngtId));

        return convertToDto(entity);
    }

    /**
     * 점검계획관리ID와 부서코드로 결과보고서 조회
     */
    @Override
    public AuditResultReportDto getAuditResultReportByAuditProgMngtIdAndDeptCd(Long auditProgMngtId, String deptCd) {
        log.debug("점검계획관리ID와 부서코드로 결과보고서 조회: {}, {}", auditProgMngtId, deptCd);

        AuditResultReport entity = auditResultReportRepository.findByAuditProgMngtIdAndDeptCd(auditProgMngtId, deptCd)
                .orElse(null);

        return entity != null ? convertToDto(entity) : null;
    }

    /**
     * 점검계획관리ID로 모든 부서 결과보고서 목록 조회
     */
    @Override
    public List<AuditResultReportDto> getAuditResultReportsByAuditProgMngtId(Long auditProgMngtId) {
        log.debug("점검계획관리ID로 모든 부서 결과보고서 목록 조회: {}", auditProgMngtId);

        // Native Query를 사용하여 조인 정보 포함 조회
        List<Object[]> nativeResults = auditResultReportRepository.findAuditResultReportsByAuditProgMngtIdNative(auditProgMngtId);
        
        return nativeResults.stream()
                .map(this::convertObjectArrayToDto)
                .collect(Collectors.toList());
    }

    /**
     * 점검결과보고서 삭제
     */
    @Override
    @Transactional
    public void deleteAuditResultReport(Long auditResultReportId) {
        log.debug("점검결과보고서 삭제: {}", auditResultReportId);

        AuditResultReport entity = auditResultReportRepository.findById(auditResultReportId)
                .orElseThrow(() -> new RuntimeException("점검결과보고서를 찾을 수 없습니다: " + auditResultReportId));

        auditResultReportRepository.delete(entity);

        log.debug("점검결과보고서 삭제 완료: {}", auditResultReportId);
    }

    /**
     * Entity를 DTO로 변환 (기본)
     */
    private AuditResultReportDto convertToDto(AuditResultReport entity) {
        return AuditResultReportDto.builder()
                .auditResultReportId(entity.getAuditResultReportId())
                .auditProgMngtId(entity.getAuditProgMngtId())
                .deptCd(entity.getDeptCd())
                .empNo(entity.getEmpNo())
                .auditResultContent(entity.getAuditResultContent())
                .empNo01(entity.getEmpNo01())
                .auditResultContent01(entity.getAuditResultContent01())
                .empNo02(entity.getEmpNo02())
                .auditResultContent02(entity.getAuditResultContent02())
                .reqMemo(entity.getReqMemo())
                .createdId(entity.getCreatedId())
                .updatedId(entity.getUpdatedId())
                .build();
    }

    /**
     * Object[] 배열을 DTO로 변환 (Native Query 결과용)
     */
    private AuditResultReportDto convertObjectArrayToDto(Object[] row) {
        return AuditResultReportDto.builder()
                .auditResultReportId(row[0] != null ? ((Number) row[0]).longValue() : null)
                .auditProgMngtId(row[1] != null ? ((Number) row[1]).longValue() : null)
                .deptCd(row[2] != null ? row[2].toString() : "")
                .deptName(row[3] != null ? row[3].toString() : "")
                .empNo(row[4] != null ? row[4].toString() : "")
                .empName(row[5] != null ? row[5].toString() : "")
                .auditResultContent(row[6] != null ? row[6].toString() : "")
                .empNo01(row[7] != null ? row[7].toString() : "")
                .empName01(row[8] != null ? row[8].toString() : "")
                .auditResultContent01(row[9] != null ? row[9].toString() : "")
                .empNo02(row[10] != null ? row[10].toString() : "")
                .empName02(row[11] != null ? row[11].toString() : "")
                .auditResultContent02(row[12] != null ? row[12].toString() : "")
                .reqMemo(row[13] != null ? row[13].toString() : "")
                .auditTitle(row[14] != null ? row[14].toString() : "")
                .createdAt(row[15] != null ? row[15].toString() : "")
                .updatedAt(row[16] != null ? row[16].toString() : "")
                .createdId(row[17] != null ? row[17].toString() : "")
                .updatedId(row[18] != null ? row[18].toString() : "")
                .build();
    }
}