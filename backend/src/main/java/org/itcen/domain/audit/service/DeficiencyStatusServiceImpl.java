package org.itcen.domain.audit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.audit.dto.DeficiencyStatusDto;
import org.itcen.domain.audit.entity.AuditProgMngt;
import org.itcen.domain.audit.entity.AuditProgMngtDetail;
import org.itcen.domain.audit.repository.AuditProgMngtDetailRepository;
import org.itcen.domain.audit.repository.AuditProgMngtRepository;
import org.itcen.domain.common.dto.CommonCodeDto;
import org.itcen.domain.common.service.CommonCodeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 미흡상황 현황 Service 구현체
 * 
 * 단일 책임 원칙(SRP): 미흡상황 현황 비즈니스 로직만 담당
 * 개방-폐쇄 원칙(OCP): 인터페이스를 구현하여 확장성 보장
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeficiencyStatusServiceImpl implements DeficiencyStatusService {

    private final AuditProgMngtDetailRepository auditProgMngtDetailRepository;
    private final AuditProgMngtRepository auditProgMngtRepository;
    private final CommonCodeService commonCodeService;

    /**
     * 전체 미흡상황 현황 목록 조회
     */
    @Override
    public List<DeficiencyStatusDto> getAllDeficiencyStatus(String startDate, String endDate) {
        log.info("전체 미흡상황 현황 조회 시작 - startDate: {}, endDate: {}", startDate, endDate);
        
        try {
            // 1. audit_prog_mngt_detail 테이블에서 audit_result_status_cd가 '미흡'인 데이터 조회
            List<AuditProgMngtDetail> deficiencyDetails = auditProgMngtDetailRepository.findByAuditResultStatusCd("미흡");
            log.info("미흡 상태 상세 데이터 조회 완료 - 건수: {}", deficiencyDetails.size());
            
            // 데이터가 없는 경우 빈 리스트 반환
            if (deficiencyDetails.isEmpty()) {
                return new ArrayList<>();
            }
            
            // 2. audit_prog_mngt 테이블에서 해당 audit_prog_mngt_id와 일치하는 데이터 조회
            List<Long> auditProgMngtIds = deficiencyDetails.stream()
                    .map(AuditProgMngtDetail::getAuditProgMngtId)
                    .distinct()
                    .collect(Collectors.toList());
            
            List<AuditProgMngt> auditProgMngts = auditProgMngtRepository.findByAuditProgMngtIdIn(auditProgMngtIds);
            log.info("점검계획 데이터 조회 완료 - 건수: {}", auditProgMngts.size());
            
            // 3. 데이터 조합하여 DTO 생성
            List<DeficiencyStatusDto> result = new ArrayList<>();
            
            for (AuditProgMngtDetail detail : deficiencyDetails) {
                AuditProgMngt audit = findMatchingAudit(auditProgMngts, detail.getAuditProgMngtId());
                
                if (audit != null) {
                    DeficiencyStatusDto dto = buildDeficiencyStatusDto(detail, audit);
                    result.add(dto);
                }
            }
            
            log.info("미흡상황 현황 조회 완료 - 총 건수: {}", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("미흡상황 현황 조회 중 오류 발생", e);
            throw new RuntimeException("미흡상황 현황 조회 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 매칭되는 점검계획 찾기
     */
    private AuditProgMngt findMatchingAudit(List<AuditProgMngt> auditProgMngts, Long auditProgMngtId) {
        return auditProgMngts.stream()
                .filter(a -> a.getAuditProgMngtId().equals(auditProgMngtId))
                .findFirst()
                .orElse(null);
    }

    /**
     * 미흡상황 DTO 생성
     */
    private DeficiencyStatusDto buildDeficiencyStatusDto(AuditProgMngtDetail detail, AuditProgMngt audit) {
        return DeficiencyStatusDto.builder()
                // detail 테이블 정보 (실제 DB 컬럼)
                .auditProgMngtDetailId(detail.getAuditProgMngtDetailId())
                .auditProgMngtId(detail.getAuditProgMngtId())
                .hodIcItemId(detail.getHodIcItemId())
                .auditMenId(detail.getAuditMenId())
                .auditResult(detail.getAuditResult())
                .auditResultStatusCd(detail.getAuditResultStatusCd())
                .beforeAuditYn(detail.getBeforeAuditYn())
                .auditDetailContent(detail.getAuditDetailContent())
                .auditDoneDt(detail.getAuditDoneDt())
                .auditDoneContent(detail.getAuditDoneContent())
                .impPlStatusCd(detail.getImpPlStatusCd())
                
                // 화면 표시용 필드 매핑
                .deficiencyContent(getDeficiencyContent(detail.getAuditDetailContent()))
                .improvementPlan(getImprovementStatusByCode(detail.getImpPlStatusCd()))
                .implementationResult(getImplementationResultByStatus(detail.getAuditResultStatusCd()))
                .dueDate(detail.getAuditDoneDt())
                .inspectorId(detail.getAuditMenId())
                
                // audit 테이블 정보
                .auditProgMngtCd(audit.getAuditProgMngtCd())
                .ledgerOrdersHod(audit.getLedgerOrdersHod())
                .auditTitle(audit.getAuditTitle())
                .auditStartDt(audit.getAuditStartDt())
                .auditEndDt(audit.getAuditEndDt())
                .auditStatusCd(audit.getAuditStatusCd())
                .auditContents(getAuditContents(audit.getAuditContents()))
                
                // 추가 정보
                .inspectionRound(audit.getAuditTitle())
                .department("부서미정") // TODO: 실제 부서 정보 매핑 필요
                .statusCode(detail.getAuditResultStatusCd())
                .statusName(getStatusName(detail.getAuditResultStatusCd()))
                .writeDate(getWriteDate(audit.getAuditStartDt()))
                .build();
    }

    /**
     * 미흡사항 내용 반환
     */
    private String getDeficiencyContent(String auditDetailContent) {
        return auditDetailContent != null && !auditDetailContent.trim().isEmpty() 
                ? auditDetailContent : "미흡사항 미입력";
    }

    /**
     * 점검내용 반환
     */
    private String getAuditContents(String auditContents) {
        return auditContents != null && !auditContents.trim().isEmpty() 
                ? auditContents : "점검내용 미입력";
    }

    /**
     * 작성일자 반환
     */
    private String getWriteDate(LocalDate auditStartDt) {
        return auditStartDt != null ? auditStartDt.toString() : null;
    }

    @Override
    @Transactional
    public DeficiencyStatusDto updateDeficiencyStatus(DeficiencyStatusDto dto) {
        // TODO: 수정 구현
        return null;
    }

    @Override
    @Transactional
    public void deleteDeficiencyStatus(Long id) {
        // TODO: 삭제 구현
    }

    @Override
    @Transactional
    public void updateImplementationResult(List<Long> ids, String implementationResult, 
            String completionDate, String statusCode, String remarks) {
        log.info("이행결과 작성 시작 - ids: {}, implementationResult: {}", ids, implementationResult);
        
        try {
            for (Long id : ids) {
                AuditProgMngtDetail detail = auditProgMngtDetailRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("미흡상황 데이터를 찾을 수 없습니다. ID: " + id));
                
                // 이행결과 내용 업데이트
                detail.setAuditDoneContent(implementationResult);
                
                // 완료일자가 있으면 업데이트
                if (completionDate != null && !completionDate.trim().isEmpty()) {
                    try {
                        LocalDate doneDate = LocalDate.parse(completionDate);
                        detail.setAuditDoneDt(doneDate);
                    } catch (Exception e) {
                        log.warn("완료일자 파싱 실패: {}", completionDate);
                    }
                }
                
                // 상태코드 업데이트 (이행작성 상태로 변경)
                if (statusCode != null && !statusCode.trim().isEmpty()) {
                    // 개선계획상태코드를 이행작성으로 변경
                    detail.setImpPlStatusCd("PLI04"); // PLI04: 이행작성
                }
                
                auditProgMngtDetailRepository.save(detail);
                log.info("이행결과 업데이트 완료 - ID: {}", id);
            }
            
            log.info("이행결과 작성 완료 - 총 {}건", ids.size());
            
        } catch (Exception e) {
            log.error("이행결과 작성 중 오류 발생", e);
            throw new RuntimeException("이행결과 작성 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    @Transactional
    public void approveDeficiencyStatus(List<Long> ids, String approvalStatus, String approvalComments) {
        // TODO: 승인 처리 구현
    }

    @Override
    public List<String> getInspectionRoundList() {
        // TODO: 점검회차 목록 조회 구현
        return List.of("2024-001", "2024-002", "2024-003");
    }

    @Override
    public List<String> getDepartmentList() {
        // TODO: 부서 목록 조회 구현
        return List.of("영업부", "인사부", "재무부");
    }
    
    /**
     * 점검결과상태코드에 따른 이행결과 텍스트 반환
     */
    private String getImplementationResultByStatus(String statusCd) {
        if (statusCd == null) return "상태미정";
        
        switch (statusCd) {
            case "미흡":
                return "개선 필요";
            case "적성":
                return "적정";
            case "진행중":
                return "진행중";
            case "제외":
                return "점검제외";
            default:
                return statusCd;
        }
    }
    
    /**
     * 점검결과상태코드에 따른 상태명 반환
     */
    private String getStatusName(String statusCd) {
        if (statusCd == null) return "상태미정";
        
        switch (statusCd) {
            case "미흡":
                return "미흡";
            case "적성":
                return "적정";
            case "진행중":
                return "진행중";
            case "제외":
                return "점검제외";
            default:
                return statusCd;
        }
    }
    
    /**
     * 개선계획상태코드에 따른 개선현황 텍스트 반환 (공통코드 사용)
     */
    private String getImprovementStatusByCode(String impPlStatusCd) {
        if (impPlStatusCd == null || impPlStatusCd.trim().isEmpty()) {
            return "개선계획 미수립";
        }
        
        try {
            // PLAN_IMP 그룹에서 해당 코드의 코드명 조회
            return commonCodeService.findByGroupCodeAndCode("PLAN_IMP", impPlStatusCd.trim())
                    .map(CommonCodeDto.Response::getCodeName)
                    .orElse(impPlStatusCd); // 공통코드에 없으면 원본 코드 반환
        } catch (Exception e) {
            log.warn("공통코드 조회 실패 - groupCode: PLAN_IMP, code: {}, error: {}", impPlStatusCd, e.getMessage());
            return impPlStatusCd; // 에러 시 원본 코드 반환
        }
    }
}