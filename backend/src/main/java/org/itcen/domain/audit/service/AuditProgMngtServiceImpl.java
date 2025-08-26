package org.itcen.domain.audit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.audit.dto.AuditItemStatusResponseDto;
import org.itcen.domain.audit.dto.AuditProgMngtDto;
import org.itcen.domain.audit.dto.DeptAuditResultStatusDto;
import org.itcen.domain.audit.dto.DeptImprovementPlanStatusDto;
import org.itcen.domain.audit.entity.AuditProgMngt;
import org.itcen.domain.audit.entity.AuditProgMngtDetail;
import org.itcen.domain.audit.repository.AuditProgMngtDetailRepository;
import org.itcen.domain.audit.repository.AuditProgMngtRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 점검계획관리 Service 구현체
 * 
 * 단일 책임 원칙(SRP): 점검계획관리 비즈니스 로직만 담당
 * 의존성 역전 원칙(DIP): Repository 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditProgMngtServiceImpl implements AuditProgMngtService {

    private final AuditProgMngtRepository auditProgMngtRepository;
    private final AuditProgMngtDetailRepository auditProgMngtDetailRepository;

    /**
     * 점검계획 등록
     */
    @Override
    @Transactional
    public AuditProgMngtDto createAuditProgMngt(AuditProgMngtDto dto) {
        log.debug("점검계획 등록 시작: {}", dto);

        // 점검계획코드 자동 생성
        String auditProgMngtCd = generateAuditProgMngtCd();
        
        // 점검계획 메인 테이블 저장
        AuditProgMngt auditProgMngt = AuditProgMngt.builder()
                .auditProgMngtCd(auditProgMngtCd)
                .ledgerOrdersHod(dto.getLedgerOrdersHod())
                .auditTitle(dto.getAuditTitle())
                .auditStartDt(dto.getAuditStartDt())
                .auditEndDt(dto.getAuditEndDt())
                .auditStatusCd(dto.getAuditStatusCd())
                .auditContents(dto.getAuditContents())
                .build();

        AuditProgMngt savedAuditProgMngt = auditProgMngtRepository.save(auditProgMngt);

        // 점검계획 상세 테이블 저장
        if (dto.getTargetItemData() != null && !dto.getTargetItemData().isEmpty()) {
            for (AuditProgMngtDto.TargetItemData targetItem : dto.getTargetItemData()) {
                AuditProgMngtDetail detail = AuditProgMngtDetail.builder()
                        .auditProgMngtId(savedAuditProgMngt.getAuditProgMngtId())
                        .auditProgMngtCd(auditProgMngtCd)
                        .hodIcItemId(targetItem.getHodIcItemId())
                        .responsibilityId(targetItem.getResponsibilityId())
                        .responsibilityDetailId(targetItem.getResponsibilityDetailId())
                        .beforeAuditYn("N")
                        .build();
                savedAuditProgMngt.addDetail(detail);
            }
            // cascade로 상세 항목들 자동 저장
            auditProgMngtRepository.save(savedAuditProgMngt);
        } else if (dto.getTargetItemIds() != null && !dto.getTargetItemIds().isEmpty()) {
            // 기존 방식 호환성 유지 (targetItemIds만 있는 경우)
            for (Long hodIcItemId : dto.getTargetItemIds()) {
                AuditProgMngtDetail detail = AuditProgMngtDetail.builder()
                        .auditProgMngtId(savedAuditProgMngt.getAuditProgMngtId())
                        .auditProgMngtCd(auditProgMngtCd)
                        .hodIcItemId(hodIcItemId)
                        .beforeAuditYn("N")
                        .build();
                savedAuditProgMngt.addDetail(detail);
            }
            // cascade로 상세 항목들 자동 저장
            auditProgMngtRepository.save(savedAuditProgMngt);
        }

        log.debug("점검계획 등록 완료: {}", auditProgMngtCd);
        return AuditProgMngtDto.fromEntity(savedAuditProgMngt);
    }

    /**
     * 점검계획 수정
     */
    @Override
    @Transactional
    public AuditProgMngtDto updateAuditProgMngt(AuditProgMngtDto dto) {
        log.debug("점검계획 수정 시작: {}", dto.getAuditProgMngtCd());

        AuditProgMngt auditProgMngt = auditProgMngtRepository.findByAuditProgMngtCd(dto.getAuditProgMngtCd())
                .orElseThrow(() -> new RuntimeException("점검계획을 찾을 수 없습니다: " + dto.getAuditProgMngtCd()));

        // 점검계획 메인 정보 수정
        AuditProgMngt updatedAuditProgMngt = AuditProgMngt.builder()
                .auditProgMngtId(auditProgMngt.getAuditProgMngtId())
                .auditProgMngtCd(auditProgMngt.getAuditProgMngtCd())
                .ledgerOrdersHod(dto.getLedgerOrdersHod())
                .auditTitle(dto.getAuditTitle())
                .auditStartDt(dto.getAuditStartDt())
                .auditEndDt(dto.getAuditEndDt())
                .auditStatusCd(dto.getAuditStatusCd())
                .auditContents(dto.getAuditContents())
                .build();

        AuditProgMngt savedAuditProgMngt = auditProgMngtRepository.save(updatedAuditProgMngt);

        // 기존 상세 데이터 삭제 후 새로 등록
        if (dto.getTargetItemData() != null && !dto.getTargetItemData().isEmpty()) {
            // 기존 상세 항목들 모두 제거
            savedAuditProgMngt.clearDetails();
            
            // 새로운 상세 항목들 추가
            for (AuditProgMngtDto.TargetItemData targetItem : dto.getTargetItemData()) {
                AuditProgMngtDetail detail = AuditProgMngtDetail.builder()
                        .auditProgMngtId(savedAuditProgMngt.getAuditProgMngtId())
                        .auditProgMngtCd(dto.getAuditProgMngtCd())
                        .hodIcItemId(targetItem.getHodIcItemId())
                        .responsibilityId(targetItem.getResponsibilityId())
                        .responsibilityDetailId(targetItem.getResponsibilityDetailId())
                        .beforeAuditYn("N")
                        .build();
                savedAuditProgMngt.addDetail(detail);
            }
            
            // 변경사항 저장 (cascade로 상세 항목들도 자동 저장)
            auditProgMngtRepository.save(savedAuditProgMngt);
        } else if (dto.getTargetItemIds() != null) {
            // 기존 방식 호환성 유지 (targetItemIds만 있는 경우)
            // 기존 상세 항목들 모두 제거
            savedAuditProgMngt.clearDetails();
            
            // 새로운 상세 항목들 추가
            for (Long hodIcItemId : dto.getTargetItemIds()) {
                AuditProgMngtDetail detail = AuditProgMngtDetail.builder()
                        .auditProgMngtId(savedAuditProgMngt.getAuditProgMngtId())
                        .auditProgMngtCd(dto.getAuditProgMngtCd())
                        .hodIcItemId(hodIcItemId)
                        .beforeAuditYn("N")
                        .build();
                savedAuditProgMngt.addDetail(detail);
            }
            
            // 변경사항 저장 (cascade로 상세 항목들도 자동 저장)
            auditProgMngtRepository.save(savedAuditProgMngt);
        }

        log.debug("점검계획 수정 완료: {}", dto.getAuditProgMngtCd());
        return AuditProgMngtDto.fromEntity(savedAuditProgMngt);
    }

    /**
     * 점검계획 조회
     */
    @Override
    public AuditProgMngtDto getAuditProgMngt(String auditProgMngtCd) {
        log.debug("점검계획 조회: {}", auditProgMngtCd);

        AuditProgMngt auditProgMngt = auditProgMngtRepository.findByAuditProgMngtCd(auditProgMngtCd)
                .orElseThrow(() -> new RuntimeException("점검계획을 찾을 수 없습니다: " + auditProgMngtCd));

        return AuditProgMngtDto.fromEntity(auditProgMngt);
    }

    /**
     * 점검계획 삭제
     */
    @Override
    @Transactional
    public void deleteAuditProgMngt(String auditProgMngtCd) {
        log.debug("점검계획 삭제: {}", auditProgMngtCd);

        // 메인 데이터 조회
        AuditProgMngt auditProgMngt = auditProgMngtRepository.findByAuditProgMngtCd(auditProgMngtCd)
                .orElseThrow(() -> new RuntimeException("점검계획을 찾을 수 없습니다: " + auditProgMngtCd));

        Long auditProgMngtId = auditProgMngt.getAuditProgMngtId();
        
        log.debug("삭제 대상 ID: {}, 코드: {}", auditProgMngtId, auditProgMngtCd);

        // JPA cascade로 상세 데이터 자동 삭제됨
        auditProgMngtRepository.deleteById(auditProgMngtId);
        
        log.debug("점검계획 삭제 완료: {} (ID: {})", auditProgMngtCd, auditProgMngtId);
    }

    /**
     * 점검계획코드 자동 생성
     * 형식: AUDIT + YYYYMMDD + 3자리 일련번호
     */
    private String generateAuditProgMngtCd() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "AUDIT" + today;

        // 오늘 날짜로 시작하는 가장 최근 코드 조회
        Optional<AuditProgMngt> latestAudit = auditProgMngtRepository.findTopByOrderByAuditProgMngtCdDesc();
        
        int sequenceNumber = 1;
        if (latestAudit.isPresent()) {
            String latestCode = latestAudit.get().getAuditProgMngtCd();
            if (latestCode.startsWith(prefix)) {
                // 같은 날짜의 코드가 있다면 일련번호 증가
                String sequencePart = latestCode.substring(prefix.length());
                try {
                    sequenceNumber = Integer.parseInt(sequencePart) + 1;
                } catch (NumberFormatException e) {
                    log.warn("점검계획코드 파싱 오류: {}", latestCode);
                }
            }
        }

        return prefix + String.format("%03d", sequenceNumber);
    }

    /**
     * 점검계획관리 현황 목록 조회 (전체)
     */
    @Override
    public List<AuditProgMngtDto> getAllAuditProgMngtStatus(String startDate, String endDate) {
        log.debug("점검계획관리 현황 목록 조회 - startDate: {}, endDate: {}", startDate, endDate);

        List<AuditProgMngt> auditProgMngts;
        
        if (startDate != null && endDate != null) {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            auditProgMngts = auditProgMngtRepository.findByAuditStartDtBetween(start, end);
        } else {
            auditProgMngts = auditProgMngtRepository.findAll();
        }

        return auditProgMngts.stream()
                .map(entity -> {
                    // 대상 점검항목수 계산
                    int targetItemCount = auditProgMngtDetailRepository
                            .findByAuditProgMngtId(entity.getAuditProgMngtId()).size();
                    
                    return convertToStatusDto(entity, targetItemCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * 점검계획관리 현황 조회 (파라미터 기반)
     */
    @Override
    public List<AuditProgMngtDto> getAuditProgMngtStatus(String auditTypeCd, String auditStatusCd, 
                                                        String auditTeamLeader, String startDate, String endDate) {
        log.debug("점검계획관리 현황 조회 - auditTypeCd: {}, auditStatusCd: {}, auditTeamLeader: {}, startDate: {}, endDate: {}",
                auditTypeCd, auditStatusCd, auditTeamLeader, startDate, endDate);

        // 현재는 전체 조회와 동일하게 처리 (추후 필터링 로직 추가 가능)
        return getAllAuditProgMngtStatus(startDate, endDate);
    }

    /**
     * Entity를 현황 DTO로 변환
     */
    private AuditProgMngtDto convertToStatusDto(AuditProgMngt entity, int targetItemCount) {
        AuditProgMngtDto dto = AuditProgMngtDto.fromEntity(entity);
        
        // 점검계획ID로 연결된 책무 내용들 조회
        List<String> responsibilityContents = auditProgMngtRepository
                .findResponsibilityContentsByAuditProgMngtId(entity.getAuditProgMngtId());
        
        // 책무 내용들을 auditTarget으로 설정
        String auditTarget = formatResponsibilityContents(responsibilityContents);
        
        // 현황 조회용 추가 필드 설정
        dto.setAuditProgName(entity.getAuditTitle()); // auditTitle을 auditProgName으로 매핑
        dto.setAuditTypeCd("REGULAR"); // 기본값: 정기점검
        dto.setAuditTypeName("정기점검"); // 기본값
        dto.setAuditTarget(auditTarget); // 실제 책무 내용들로 설정
        dto.setAuditStartDate(entity.getAuditStartDt().toString());
        dto.setAuditEndDate(entity.getAuditEndDt().toString());
        dto.setAuditTeamLeader("시스템관리자"); // 기본값
        dto.setAuditTeamMembers(""); // 기본값
        dto.setAuditStatusName(getStatusName(entity.getAuditStatusCd()));
        dto.setTargetItemCount(targetItemCount);
        dto.setApprovalId(null); // 기본값
        dto.setApprovalStatus(""); // 기본값
        dto.setRemarks(entity.getAuditContents());
        dto.setCreatedAt(entity.getCreatedAt().toLocalDate().toString());
        dto.setUpdatedAt(entity.getUpdatedAt().toLocalDate().toString());
        
        return dto;
    }
    
    /**
     * 책무 내용들을 표시용 문자열로 포맷팅
     */
    private String formatResponsibilityContents(List<String> responsibilityContents) {
        if (responsibilityContents == null || responsibilityContents.isEmpty()) {
            return "선정된 항목 없음";
        }
        
        // null이나 빈 문자열 제거
        List<String> validContents = responsibilityContents.stream()
                .filter(content -> content != null && !content.trim().isEmpty())
                .collect(Collectors.toList());
        
        if (validContents.isEmpty()) {
            return "선정된 항목 없음";
        }
        
        if (validContents.size() == 1) {
            return validContents.get(0);
        }
        
        if (validContents.size() <= 3) {
            // 3개 이하면 모두 표시
            return String.join(", ", validContents);
        } else {
            // 3개 초과면 첫 번째 항목과 개수 표시
            return validContents.get(0) + " 외 " + (validContents.size() - 1) + "개";
        }
    }

    /**
     * 점검 현황(항목별) 조회
     * 
     * audit_prog_mngt와 audit_prog_mngt_detail 조인 후
     * hod_ic_item과 responsibility, positions 조인
     * role_resp_status는 left outer 조인
     */
    @Override
    public List<AuditItemStatusResponseDto> getAuditItemStatus(Long ledgerOrdersHod, String auditResultStatusCd) {
        log.debug("점검 현황(항목별) 조회 - ledgerOrdersHod: {}, auditResultStatusCd: {}", 
                ledgerOrdersHod, auditResultStatusCd);

        // 빈 문자열을 null로 변환 (Optional 조건 처리를 위해)
        String finalAuditResultStatusCd = (auditResultStatusCd != null && auditResultStatusCd.trim().isEmpty()) ? null : auditResultStatusCd;

        // Native Query를 사용하여 Object[] 결과 조회
        List<Object[]> nativeResults = auditProgMngtRepository.findAuditItemStatusNative(
                ledgerOrdersHod, 
                finalAuditResultStatusCd
        );

        log.debug("Native Query 결과: {}건", nativeResults.size());

        // Object[] 결과를 AuditItemStatusResponseDto로 변환
        List<AuditItemStatusResponseDto> result = nativeResults.stream()
                .map(this::convertObjectArrayToDto)
                .collect(Collectors.toList());

        log.debug("점검 현황(항목별) 조회 결과: {}건", result.size());
        return result;
    }

    /**
     * 결재 승인 시 점검계획관리상세의 개선계획상태코드를 PLI03으로 업데이트
     * 동시에 점검최종결과여부를 'Y'로 업데이트
     */
    @Override
    @Transactional
    public int updateImpPlStatusToPLI03(Long auditProgMngtDetailId) {
        log.debug("점검계획관리상세 상태 업데이트 시작 - auditProgMngtDetailId: {}", auditProgMngtDetailId);
        
        if (auditProgMngtDetailId == null) {
            throw new IllegalArgumentException("점검계획관리상세 ID는 필수입니다.");
        }
        
        int updatedCount = auditProgMngtDetailRepository.updateImpPlStatusToPLI03(auditProgMngtDetailId);
        
        log.debug("점검계획관리상세 상태 업데이트 완료 - auditProgMngtDetailId: {}, 업데이트된 레코드 수: {} (imp_pl_status_cd='PLI03', audit_final_result_yn='Y')", 
                auditProgMngtDetailId, updatedCount);
        
        return updatedCount;
    }

    /**
     * Object[] 배열을 AuditItemStatusResponseDto로 변환
     * Native Query 결과를 DTO로 매핑
     */
    private AuditItemStatusResponseDto convertObjectArrayToDto(Object[] row) {
        return AuditItemStatusResponseDto.builder()
                .hodIcItemId(row[0] != null ? ((Number) row[0]).longValue() : null)
                .auditProgMngtDetailId(row[1] != null ? ((Number) row[1]).longValue() : null)
                .responsibilityContent(row[2] != null ? row[2].toString() : "")
                .responsibilityDetailContent(row[3] != null ? row[3].toString() : "")
                .positionsNm(row[4] != null ? row[4].toString() : "미정")
                .deptCd(row[5] != null ? row[5].toString() : "")
                .deptName(row[6] != null ? row[6].toString() : "")  // 부서명 추가
                .fieldTypeCd(row[7] != null ? row[7].toString() : "")
                .roleTypeCd(row[8] != null ? row[8].toString() : "")
                .icTask(row[9] != null ? row[9].toString() : "")
                .auditMenId(row[10] != null ? row[10].toString() : "")
                .auditResultStatusCd(row[11] != null ? row[11].toString() : "")
                .roleSumm(row[12] != null ? row[12].toString() : "")
                .ledgerOrdersHod(row[13] != null ? ((Number) row[13]).longValue() : 0L)
                .auditResult(row[14] != null ? row[14].toString() : "")
                .auditDoneDt(row[15] != null ? row[15].toString() : "")
                .auditDetailContent(row[16] != null ? row[16].toString() : "")
                .auditStatusCd(row[17] != null ? row[17].toString() : "")
                .responsibilityId(row[18] != null ? ((Number) row[18]).longValue() : 0L)
                .auditTitle(row[19] != null ? row[19].toString() : "")
                .auditStatusCdFromProgMngt(row[20] != null ? row[20].toString() : "")
                .impPlStatusCd(row[21] != null ? row[21].toString() : "")
                .auditDoneContent(row[22] != null ? row[22].toString() : "")
                .approvalId(row[23] != null ? ((Number) row[23]).longValue() : 0L)
                .approvalStatusCd(row[24] != null ? row[24].toString() : "")
                .auditFinalResultYn(row[25] != null ? row[25].toString() : "N")
                .build();
    }

    /**
     * 부서별 점검결과 현황 조회
     */
    @Override
    public List<DeptAuditResultStatusDto> getDeptAuditResultStatus(Long ledgerOrdersId, String deptCd) {
        log.debug("부서별 점검결과 현황 조회 - ledgerOrdersId: {}, deptCd: {}", ledgerOrdersId, deptCd);

        // Native Query를 사용하여 Object[] 결과 조회
        List<Object[]> nativeResults = auditProgMngtRepository.findDeptAuditResultStatusNative(ledgerOrdersId, deptCd);
        
        log.debug("부서별 점검결과 현황 Native Query 결과: {}건", nativeResults.size());

        // Object[] 결과를 DeptAuditResultStatusDto로 변환
        List<DeptAuditResultStatusDto> result = nativeResults.stream()
                .map(this::convertObjectArrayToDeptAuditResultStatusDto)
                .collect(Collectors.toList());

        log.debug("부서별 점검결과 현황 조회 결과: {}건", result.size());
        return result;
    }

    /**
     * 부서별 개선계획등록 현황 조회
     */
    @Override
    public List<DeptImprovementPlanStatusDto> getDeptImprovementPlanStatus(Long ledgerOrdersId, String deptCd) {
        log.debug("부서별 개선계획등록 현황 조회 - ledgerOrdersId: {}, deptCd: {}", ledgerOrdersId, deptCd);

        // Native Query를 사용하여 Object[] 결과 조회
        List<Object[]> nativeResults = auditProgMngtRepository.findDeptImprovementPlanStatusNative(ledgerOrdersId, deptCd);
        
        log.debug("부서별 개선계획등록 현황 Native Query 결과: {}건", nativeResults.size());

        // Object[] 결과를 DeptImprovementPlanStatusDto로 변환
        List<DeptImprovementPlanStatusDto> result = nativeResults.stream()
                .map(this::convertObjectArrayToDeptImprovementPlanStatusDto)
                .collect(Collectors.toList());

        log.debug("부서별 개선계획등록 현황 조회 결과: {}건", result.size());
        return result;
    }

    /**
     * Object[] 배열을 DeptAuditResultStatusDto로 변환
     * Native Query 결과를 DTO로 매핑
     * audit_result_report와 approval 정보 포함
     */
    private DeptAuditResultStatusDto convertObjectArrayToDeptAuditResultStatusDto(Object[] row) {
        return DeptAuditResultStatusDto.builder()
                .deptCd(row[0] != null ? row[0].toString() : "")
                .deptName(row[1] != null ? row[1].toString() : "미지정")
                .totalCount(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                .appropriateCount(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                .inadequateCount(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                .excludedCount(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                .appropriateRate(row[6] != null ? ((Number) row[6]).doubleValue() : 0.0)
                .auditProgMngtId(row[7] != null ? ((Number) row[7]).longValue() : null)
                .auditResultReportId(row[8] != null ? ((Number) row[8]).longValue() : null)
                .approvalId(row[9] != null ? ((Number) row[9]).longValue() : null)
                .approvalStatusCd(row[10] != null ? row[10].toString() : "NONE")
                .approvalStatusName(row[11] != null ? row[11].toString() : "미결재")
                .build();
    }

    /**
     * Object[] 배열을 DeptImprovementPlanStatusDto로 변환
     * Native Query 결과를 DTO로 매핑
     */
    private DeptImprovementPlanStatusDto convertObjectArrayToDeptImprovementPlanStatusDto(Object[] row) {
        return DeptImprovementPlanStatusDto.builder()
                .deptCd(row[0] != null ? row[0].toString() : "")
                .deptName(row[1] != null ? row[1].toString() : "미지정")
                .inadequateCount(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                .planCreatedCount(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                .resultWrittenCount(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                .resultApprovedCount(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                .completionRate(row[6] != null ? ((Number) row[6]).doubleValue() : 0.0)
                .build();
    }

    /**
     * 상태코드를 상태명으로 변환
     */
    private String getStatusName(String statusCd) {
        if (statusCd == null) return "미정";
        
        switch (statusCd) {
            case "AUDIT_APPLY":
                return "점검신청";
            case "AUDIT_PROGRESS":
                return "진행중";
            case "AUDIT_COMPLETE":
                return "완료";
            case "AUDIT_CLOSED":
                return "점검마감";
            default:
                return "미정";
        }
    }
}