package org.itcen.domain.positions.service;

import java.util.List;
import java.util.stream.Collectors;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.common.entity.CommonCode;
import org.itcen.domain.common.repository.CommonCodeRepository;
import org.itcen.domain.positions.dto.LedgerOrdersHodSelectDto;
import org.itcen.domain.positions.entity.LedgerOrdersHod;
import org.itcen.domain.positions.repository.LedgerOrdersHodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 부서장 원장차수 Service 구현체
 *
 * 부서장 원장차수의 비즈니스 로직을 구현합니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 부서장 원장차수 비즈니스 로직만 담당
 * - Open/Closed: 새로운 기능 추가 시 확장 가능
 * - Liskov Substitution: LedgerOrdersHodService 인터페이스를 올바르게 구현
 * - Interface Segregation: 필요한 인터페이스만 의존
 * - Dependency Inversion: 구체적인 구현이 아닌 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LedgerOrdersHodServiceImpl implements LedgerOrdersHodService {

    private final LedgerOrdersHodRepository ledgerOrdersHodRepository;
    private final CommonCodeRepository commonCodeRepository;

    /**
     * 부서장 원장차수 SelectBox용 목록 조회
     */
    @Override
    public List<LedgerOrdersHodSelectDto> getLedgerOrdersHodSelectList() {
        log.debug("부서장 원장차수 SelectBox용 목록 조회 시작");
        
        try {
            List<LedgerOrdersHod> ledgerOrdersHodList = ledgerOrdersHodRepository.findAllOrderByIdDesc();
            
            List<LedgerOrdersHodSelectDto> result = ledgerOrdersHodList.stream()
                .map(this::convertToSelectDto)
                .collect(Collectors.toList());
            
            log.debug("부서장 원장차수 SelectBox용 목록 조회 완료, 건수: {}", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("부서장 원장차수 SelectBox용 목록 조회 중 오류 발생", e);
            throw new BusinessException("부서장 원장차수 목록 조회에 실패했습니다.");
        }
    }

    /**
     * 모든 부서장 원장차수 목록 조회
     */
    @Override
    public List<LedgerOrdersHod> getAllLedgerOrdersHod() {
        log.debug("모든 부서장 원장차수 목록 조회 시작");
        
        try {
            List<LedgerOrdersHod> result = ledgerOrdersHodRepository.findAllOrderByIdDesc();
            log.debug("모든 부서장 원장차수 목록 조회 완료, 건수: {}", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("모든 부서장 원장차수 목록 조회 중 오류 발생", e);
            throw new BusinessException("부서장 원장차수 목록 조회에 실패했습니다.");
        }
    }

    /**
     * 부서장 원장차수 상세 조회
     */
    @Override
    public LedgerOrdersHod getLedgerOrdersHodById(Long id) {
        log.debug("부서장 원장차수 상세 조회 시작, ID: {}", id);
        
        return ledgerOrdersHodRepository.findById(id)
            .orElseThrow(() -> {
                log.warn("부서장 원장차수를 찾을 수 없습니다. ID: {}", id);
                return new BusinessException("부서장 원장차수를 찾을 수 없습니다.");
            });
    }

    /**
     * 필드타입코드로 부서장 원장차수 목록 조회
     */
    @Override
    public List<LedgerOrdersHod> getLedgerOrdersHodByFieldType(String fieldTypeCd) {
        log.debug("필드타입코드로 부서장 원장차수 목록 조회 시작, fieldTypeCd: {}", fieldTypeCd);
        
        try {
            List<LedgerOrdersHod> result = ledgerOrdersHodRepository.findByLedgerOrdersHodFieldTypeCd(fieldTypeCd);
            log.debug("필드타입코드로 부서장 원장차수 목록 조회 완료, 건수: {}", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("필드타입코드로 부서장 원장차수 목록 조회 중 오류 발생", e);
            throw new BusinessException("부서장 원장차수 목록 조회에 실패했습니다.");
        }
    }

    /**
     * 부서장 원장차수 생성
     */
    @Override
    @Transactional
    public LedgerOrdersHod createLedgerOrdersHod(LedgerOrdersHod ledgerOrdersHod) {
        log.debug("부서장 원장차수 생성 시작");
        
        try {
            // 제목 중복 체크
            if (ledgerOrdersHod.getLedgerOrdersHodTitle() != null &&
                ledgerOrdersHodRepository.existsByLedgerOrdersHodTitle(ledgerOrdersHod.getLedgerOrdersHodTitle())) {
                throw new BusinessException("이미 존재하는 제목입니다.");
            }
            
            LedgerOrdersHod result = ledgerOrdersHodRepository.save(ledgerOrdersHod);
            log.debug("부서장 원장차수 생성 완료, ID: {}", result.getLedgerOrdersHodId());
            return result;
            
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("부서장 원장차수 생성 중 오류 발생", e);
            throw new BusinessException("부서장 원장차수 생성에 실패했습니다.");
        }
    }

    /**
     * 부서장 원장차수 수정
     */
    @Override
    @Transactional
    public LedgerOrdersHod updateLedgerOrdersHod(Long id, LedgerOrdersHod ledgerOrdersHod) {
        log.debug("부서장 원장차수 수정 시작, ID: {}", id);
        
        try {
            LedgerOrdersHod existingLedgerOrdersHod = getLedgerOrdersHodById(id);
            
            // 제목 중복 체크 (수정 시)
            if (ledgerOrdersHod.getLedgerOrdersHodTitle() != null &&
                ledgerOrdersHodRepository.existsByLedgerOrdersHodTitleAndLedgerOrdersHodIdNot(
                    ledgerOrdersHod.getLedgerOrdersHodTitle(), id)) {
                throw new BusinessException("이미 존재하는 제목입니다.");
            }
            
            // 수정할 필드들 업데이트
            if (ledgerOrdersHod.getLedgerOrdersHodTitle() != null) {
                existingLedgerOrdersHod.setLedgerOrdersHodTitle(ledgerOrdersHod.getLedgerOrdersHodTitle());
            }
            if (ledgerOrdersHod.getLedgerOrdersHodFieldTypeCd() != null) {
                existingLedgerOrdersHod.setLedgerOrdersHodFieldTypeCd(ledgerOrdersHod.getLedgerOrdersHodFieldTypeCd());
            }
            if (ledgerOrdersHod.getLedgerOrdersHodStatusCd() != null) {
                existingLedgerOrdersHod.setLedgerOrdersHodStatusCd(ledgerOrdersHod.getLedgerOrdersHodStatusCd());
            }
            if (ledgerOrdersHod.getLedgerOrdersHodConfCd() != null) {
                existingLedgerOrdersHod.setLedgerOrdersHodConfCd(ledgerOrdersHod.getLedgerOrdersHodConfCd());
            }
            
            LedgerOrdersHod result = ledgerOrdersHodRepository.save(existingLedgerOrdersHod);
            log.debug("부서장 원장차수 수정 완료, ID: {}", result.getLedgerOrdersHodId());
            return result;
            
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("부서장 원장차수 수정 중 오류 발생", e);
            throw new BusinessException("부서장 원장차수 수정에 실패했습니다.");
        }
    }

    /**
     * 부서장 원장차수 삭제
     */
    @Override
    @Transactional
    public void deleteLedgerOrdersHod(Long id) {
        log.debug("부서장 원장차수 삭제 시작, ID: {}", id);
        
        try {
            LedgerOrdersHod ledgerOrdersHod = getLedgerOrdersHodById(id);
            ledgerOrdersHodRepository.delete(ledgerOrdersHod);
            log.debug("부서장 원장차수 삭제 완료, ID: {}", id);
            
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("부서장 원장차수 삭제 중 오류 발생", e);
            throw new BusinessException("부서장 원장차수 삭제에 실패했습니다.");
        }
    }

    /**
     * 부서장 원장차수 일괄 삭제
     */
    @Override
    @Transactional
    public void deleteBulkLedgerOrdersHod(List<Long> ids) {
        log.debug("부서장 원장차수 일괄 삭제 시작, 건수: {}", ids.size());
        
        try {
            for (Long id : ids) {
                deleteLedgerOrdersHod(id);
            }
            log.debug("부서장 원장차수 일괄 삭제 완료, 건수: {}", ids.size());
            
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("부서장 원장차수 일괄 삭제 중 오류 발생", e);
            throw new BusinessException("부서장 원장차수 일괄 삭제에 실패했습니다.");
        }
    }

    /**
     * LedgerOrdersHod를 LedgerOrdersHodSelectDto로 변환
     */
    private LedgerOrdersHodSelectDto convertToSelectDto(LedgerOrdersHod ledgerOrdersHod) {
        // ledger_orders_hod_title 컬럼만 표시
        String label = ledgerOrdersHod.getLedgerOrdersHodTitle() != null ? 
            ledgerOrdersHod.getLedgerOrdersHodTitle() : "";
        
        return new LedgerOrdersHodSelectDto(
            String.valueOf(ledgerOrdersHod.getLedgerOrdersHodId()),
            label
        );
    }

    /**
     * 상태코드에 해당하는 상태명 조회
     */
    private String getStatusName(String statusCd) {
        if (statusCd == null) return "알 수 없음";
        
        try {
            return commonCodeRepository.findByGroupCodeAndCode("STATUS", statusCd)
                .map(CommonCode::getCodeName)
                .orElse("알 수 없음");
        } catch (Exception e) {
            log.warn("상태코드 조회 실패: {}", statusCd);
            return "알 수 없음";
        }
    }
}