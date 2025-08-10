package org.itcen.domain.positions.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.common.entity.CommonCode;
import org.itcen.domain.common.repository.CommonCodeRepository;
import org.itcen.domain.positions.dto.LedgerOrdersHodGenerateResponseDto;
import org.itcen.domain.positions.dto.LedgerOrdersHodSelectDto;
import org.itcen.domain.positions.entity.LedgerOrders;
import org.itcen.domain.positions.entity.LedgerOrdersHod;
import org.itcen.domain.positions.repository.LedgerOrdersHodRepository;
import org.itcen.domain.positions.repository.LedgerOrdersRepository;
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
    private final LedgerOrdersRepository ledgerOrdersRepository;

    /**
     * 부서장 원장차수 SelectBox용 목록 조회
     */
    @Override
    public List<LedgerOrdersHodSelectDto> getLedgerOrdersHodSelectList() {
        
        try {
            List<LedgerOrdersHod> ledgerOrdersHodList = ledgerOrdersHodRepository.findAllOrderByIdDesc();
            
            List<LedgerOrdersHodSelectDto> result = ledgerOrdersHodList.stream()
                .map(this::convertToSelectDto)
                .collect(Collectors.toList());
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
        
        try {
            List<LedgerOrdersHod> result = ledgerOrdersHodRepository.findAllOrderByIdDesc();
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
        
        try {
            List<LedgerOrdersHod> result = ledgerOrdersHodRepository.findByLedgerOrdersHodFieldTypeCd(fieldTypeCd);
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
        
        try {
            // 제목 중복 체크
            if (ledgerOrdersHod.getLedgerOrdersHodTitle() != null &&
                ledgerOrdersHodRepository.existsByLedgerOrdersHodTitle(ledgerOrdersHod.getLedgerOrdersHodTitle())) {
                throw new BusinessException("이미 존재하는 제목입니다.");
            }
            
            LedgerOrdersHod result = ledgerOrdersHodRepository.save(ledgerOrdersHod);
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
        
        try {
            LedgerOrdersHod ledgerOrdersHod = getLedgerOrdersHodById(id);
            ledgerOrdersHodRepository.delete(ledgerOrdersHod);
            
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
        
        try {
            for (Long id : ids) {
                deleteLedgerOrdersHod(id);
            }            
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
     * 부서장차수 생성
     * 
     * 0. ledger_orders_hod테이블에 data가 없으면 1번으로, data가 있으면 0-1번
     * 0-1. ledger_orders_hod테이블 data가 있으면 ledger_orders_hod테이블 Max ID의 상태코드/제목 조회
     * 0-2. ledger_orders_hod_status_cd = "P8" 조건 확인 
     * 0-3. 2025-001-01 값에서 01 -> 02 로 증가
     * 0-4. ledger_orders_hod 테이블 ledger_orders_hod_status_cd = P6 값 insert
     * 1. ledger_orders 테이블에서 Max ID의 레코드 조회
     * 2. ledger_orders_status_cd = "P5" 조건 확인
     * 3. ledger_orders_hod 테이블 ledger_orders_id에 Max ID값 insert
     * 4. ledger_orders_hod_title에 ledger_orders_title값에 + '-' + '01' (ex: 2025-001-01)
     * 5. ledger_orders_hod_status_cd = P6 값 insert
     * 6. LedgerOrdersHodSelect 컴포넌트 새로고침
     * 
     * @return 생성된 부서장 원장차수 응답 DTO
     */
    @Override
    @Transactional
    public LedgerOrdersHodGenerateResponseDto generateHodLedgerOrder() {
        log.info("부서장차수 생성 요청");

        try {
            // 0. ledger_orders_hod 테이블에 데이터가 있는지 확인
            Optional<LedgerOrdersHod> latestHodOrderOpt = ledgerOrdersHodRepository.findLatestLedgerOrdersHod();
            
            if (latestHodOrderOpt.isPresent()) {
                // 0-1. ledger_orders_hod 테이블에 데이터가 있으면 Max ID의 상태코드/제목 조회
                LedgerOrdersHod latestHodOrder = latestHodOrderOpt.get();
                log.info("최신 부서장차수 조회: ID={}, Title={}, Status={}", 
                        latestHodOrder.getLedgerOrdersHodId(), 
                        latestHodOrder.getLedgerOrdersHodTitle(), 
                        latestHodOrder.getLedgerOrdersHodStatusCd());

                // 0-2. ledger_orders_hod_status_cd = "P8" 조건 확인
                if (!"P8".equals(latestHodOrder.getLedgerOrdersHodStatusCd())) {
                    throw new BusinessException(
                        String.format("부서장차수를 생성할 수 없습니다. 최신 부서장차수가 확정완료(P8) 상태여야 생성 가능합니다. 현재 상태: %s", 
                            latestHodOrder.getLedgerOrdersHodStatusCd()), 
                        "INVALID_HOD_STATUS_FOR_GENERATION"
                    );
                }

                // 0-3. 2025-001-01 값에서 01 -> 02로 증가
                String currentTitle = latestHodOrder.getLedgerOrdersHodTitle();
                String newTitle = incrementHodTitle(currentTitle);
                log.info("부서장차수 제목 증가: {} -> {}", currentTitle, newTitle);

                // 0-4. ledger_orders_hod 테이블에 새로운 레코드 insert (P6 상태)
                LedgerOrdersHod newHodOrder = LedgerOrdersHod.builder()
                        .ledgerOrdersId(latestHodOrder.getLedgerOrdersId())
                        .ledgerOrdersHodTitle(newTitle)
                        .ledgerOrdersHodStatusCd("P6")
                        .build();

                LedgerOrdersHod savedOrder = ledgerOrdersHodRepository.save(newHodOrder);
                log.info("부서장차수 생성 완료: ID={}, Title={}", 
                        savedOrder.getLedgerOrdersHodId(), 
                        savedOrder.getLedgerOrdersHodTitle());

                return LedgerOrdersHodGenerateResponseDto.builder()
                        .ledgerOrdersHodId(savedOrder.getLedgerOrdersHodId())
                        .ledgerOrdersHodTitle(savedOrder.getLedgerOrdersHodTitle())
                        .ledgerOrdersHodStatusCd(savedOrder.getLedgerOrdersHodStatusCd())
                        .ledgerOrdersId(savedOrder.getLedgerOrdersId())
                        .ledgerOrdersTitle(currentTitle.substring(0, currentTitle.lastIndexOf("-"))) // 기존 원장차수 제목 추출
                        .message(String.format("부서장차수 '%s'가 생성되었습니다.", newTitle))
                        .build();
            }

            // 1. ledger_orders 테이블에서 Max ID의 레코드 조회
            Optional<LedgerOrders> latestOrderOpt = ledgerOrdersRepository.findLatestLedgerOrder();
            
            if (latestOrderOpt.isEmpty()) {
                throw new BusinessException("원장차수가 존재하지 않습니다.", "NO_LEDGER_ORDER");
            }

            LedgerOrders latestOrder = latestOrderOpt.get();
            log.info("최신 원장차수 조회: ID={}, Title={}, Status={}", 
                    latestOrder.getLedgerOrdersId(), 
                    latestOrder.getLedgerOrdersTitle(), 
                    latestOrder.getLedgerOrdersStatusCd());

            // 2. ledger_orders_status_cd = "P5" 조건 확인
            if (!"P5".equals(latestOrder.getLedgerOrdersStatusCd())) {
                throw new BusinessException(
                    String.format("부서장차수를 생성할 수 없습니다. 원장차수가 최종확정(P5) 상태여야 생성 가능합니다. 현재 상태: %s", 
                        latestOrder.getLedgerOrdersStatusCd()), 
                    "INVALID_STATUS_FOR_HOD_GENERATION"
                );
            }

            // 3. 중복 체크 - 같은 ledger_orders_id로 이미 생성된 부서장차수가 있는지 확인
            boolean exists = ledgerOrdersHodRepository.existsByLedgerOrdersId(latestOrder.getLedgerOrdersId());
            if (exists) {
                throw new BusinessException(
                    String.format("해당 원장차수(%s)의 부서장차수가 이미 존재합니다.", 
                        latestOrder.getLedgerOrdersTitle()), 
                    "HOD_ORDER_ALREADY_EXISTS"
                );
            }

            // 4. 부서장 원장차수 제목 생성 (ledger_orders_title + "-01")
            String hodTitle = latestOrder.getLedgerOrdersTitle() + "-01";

            // 5. ledger_orders_hod 테이블에 insert
            LedgerOrdersHod newHodOrder = LedgerOrdersHod.builder()
                    .ledgerOrdersId(latestOrder.getLedgerOrdersId())
                    .ledgerOrdersHodTitle(hodTitle)
                    .ledgerOrdersHodStatusCd("P6")
                    .build();

            LedgerOrdersHod savedOrder = ledgerOrdersHodRepository.save(newHodOrder);
            log.info("부서장차수 생성 완료: ID={}, Title={}", 
                    savedOrder.getLedgerOrdersHodId(), 
                    savedOrder.getLedgerOrdersHodTitle());

            // 6. 응답 DTO 생성
            return LedgerOrdersHodGenerateResponseDto.builder()
                    .ledgerOrdersHodId(savedOrder.getLedgerOrdersHodId())
                    .ledgerOrdersHodTitle(savedOrder.getLedgerOrdersHodTitle())
                    .ledgerOrdersHodStatusCd(savedOrder.getLedgerOrdersHodStatusCd())
                    .ledgerOrdersId(latestOrder.getLedgerOrdersId())
                    .ledgerOrdersTitle(latestOrder.getLedgerOrdersTitle())
                    .message(String.format("부서장차수 '%s'가 생성되었습니다.", hodTitle))
                    .build();

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("부서장차수 생성 중 예상치 못한 오류 발생", e);
            throw new BusinessException("부서장차수 생성 중 오류가 발생했습니다.", "HOD_GENERATION_ERROR");
        }
    }

    /**
     * 부서장차수 제목 증가 로직 (01 -> 02, 02 -> 03, ...)
     * 
     * @param currentTitle 현재 제목 (ex: "2025-001-01")
     * @return 증가된 제목 (ex: "2025-001-02")
     */
    private String incrementHodTitle(String currentTitle) {
        if (currentTitle == null || !currentTitle.matches(".*-\\d{2}$")) {
            throw new BusinessException("부서장차수 제목 형식이 올바르지 않습니다: " + currentTitle, "INVALID_HOD_TITLE_FORMAT");
        }

        // 마지막 "-XX" 부분을 찾아서 숫자 증가
        int lastDashIndex = currentTitle.lastIndexOf("-");
        String prefix = currentTitle.substring(0, lastDashIndex + 1); // "2025-001-"
        String numberStr = currentTitle.substring(lastDashIndex + 1); // "01"

        try {
            int currentNumber = Integer.parseInt(numberStr);
            int nextNumber = currentNumber + 1;
            
            // 2자리 숫자로 포맷 (01, 02, 03, ...)
            return prefix + String.format("%02d", nextNumber);
        } catch (NumberFormatException e) {
            throw new BusinessException("부서장차수 제목의 숫자 형식이 올바르지 않습니다: " + numberStr, "INVALID_HOD_TITLE_NUMBER");
        }
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