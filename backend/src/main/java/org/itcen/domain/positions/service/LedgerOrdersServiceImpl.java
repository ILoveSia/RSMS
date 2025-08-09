package org.itcen.domain.positions.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.positions.dto.LedgerOrdersGenerateResponseDto;
import org.itcen.domain.positions.dto.LedgerOrdersStatusCheckDto;
import org.itcen.domain.positions.entity.LedgerOrders;
import org.itcen.domain.positions.repository.LedgerOrdersRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 원장차수 Service 구현체
 * 
 * 원장차수 관련 비즈니스 로직을 구현합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 원장차수 비즈니스 로직만 담당
 * - Open/Closed: 새로운 기능 추가 시 확장 가능
 * - Liskov Substitution: LedgerOrdersService 인터페이스를 올바르게 구현
 * - Interface Segregation: 필요한 기능만 구현
 * - Dependency Inversion: 구체적인 구현이 아닌 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LedgerOrdersServiceImpl implements LedgerOrdersService {

    private final LedgerOrdersRepository ledgerOrdersRepository;

    /**
     * 현재 원장차수 상태 확인
     */
    @Override
    @Transactional(readOnly = true)
    public LedgerOrdersStatusCheckDto checkGenerationStatus() {
        log.info("원장차수 생성 가능 상태 확인 요청");

        // 최신 원장차수 조회
        Optional<LedgerOrders> latestOrderOpt = ledgerOrdersRepository.findLatestLedgerOrder();
        
        if (latestOrderOpt.isEmpty()) {
            // 첫 번째 원장차수인 경우 - 생성 가능
            log.info("첫 번째 원장차수 생성 가능");
            return LedgerOrdersStatusCheckDto.builder()
                    .hasData(false)
                    .canGenerate(true)
                    .message("첫 번째 책무번호를 생성할 수 있습니다.")
                    .build();
        }

        LedgerOrders latestOrder = latestOrderOpt.get();
        log.info("최신 원장차수 확인: ID={}, Title={}, Status={}", 
                latestOrder.getLedgerOrdersId(), 
                latestOrder.getLedgerOrdersTitle(), 
                latestOrder.getLedgerOrdersStatusCd());

        // P5 상태 확인
        boolean canGenerate = "P5".equals(latestOrder.getLedgerOrdersStatusCd());
        String message = canGenerate 
            ? "새로운 책무번호를 생성할 수 있습니다."
            : "기존차수가 최종확정이어야 신규 생성이 가능합니다.";

        return LedgerOrdersStatusCheckDto.builder()
                .currentLedgerOrdersId(latestOrder.getLedgerOrdersId())
                .currentTitle(latestOrder.getLedgerOrdersTitle())
                .currentStatusCd(latestOrder.getLedgerOrdersStatusCd())
                .hasData(true)
                .canGenerate(canGenerate)
                .message(message)
                .build();
    }

    /**
     * 새로운 책무번호(원장차수) 생성
     */
    @Override
    @Transactional
    public LedgerOrdersGenerateResponseDto generateNewLedgerOrder() {
        log.info("새로운 책무번호 생성 요청");

        // 1. 최신 원장차수 조회
        Optional<LedgerOrders> latestOrderOpt = ledgerOrdersRepository.findLatestLedgerOrder();
        
        if (latestOrderOpt.isEmpty()) {
            // 첫 번째 원장차수 생성
            return createFirstLedgerOrder();
        }

        LedgerOrders latestOrder = latestOrderOpt.get();
        log.info("최신 원장차수 조회 완료: ID={}, Title={}, Status={}", 
                latestOrder.getLedgerOrdersId(), 
                latestOrder.getLedgerOrdersTitle(), 
                latestOrder.getLedgerOrdersStatusCd());

        // 2. 진행상태 확인 (P5: 차수생성가능)
        if (!"P5".equals(latestOrder.getLedgerOrdersStatusCd())) {
            throw new BusinessException(
                String.format("새로운 차수를 생성할 수 없습니다. 현재 상태: %s (P5 상태여야 생성 가능)", 
                    latestOrder.getLedgerOrdersStatusCd()), 
                "INVALID_STATUS_FOR_GENERATION"
            );
        }

        // 3. 새로운 차수 제목 생성
        String newTitle = generateNextTitle(latestOrder.getLedgerOrdersTitle());
        
        // 4. 중복 체크
        if (ledgerOrdersRepository.existsByLedgerOrdersTitle(newTitle)) {
            throw new BusinessException(
                String.format("생성하려는 차수 제목이 이미 존재합니다: %s", newTitle), 
                "DUPLICATE_TITLE"
            );
        }

        // 5. 새로운 원장차수 생성
        LedgerOrders newOrder = LedgerOrders.builder()
                .ledgerOrdersTitle(newTitle)
                .ledgerOrdersStatusCd("P1") // 새로 생성된 차수는 P1(계획중) 상태
                .build();

        LedgerOrders savedOrder = ledgerOrdersRepository.save(newOrder);
        log.info("새로운 원장차수 생성 완료: ID={}, Title={}", savedOrder.getLedgerOrdersId(), savedOrder.getLedgerOrdersTitle());

        // 6. 응답 DTO 생성
        return LedgerOrdersGenerateResponseDto.builder()
                .ledgerOrdersId(savedOrder.getLedgerOrdersId())
                .ledgerOrdersTitle(savedOrder.getLedgerOrdersTitle())
                .ledgerOrdersStatusCd(savedOrder.getLedgerOrdersStatusCd())
                .previousTitle(latestOrder.getLedgerOrdersTitle())
                .message(String.format("새로운 책무번호 '%s'가 생성되었습니다.", savedOrder.getLedgerOrdersTitle()))
                .build();
    }

    /**
     * 첫 번째 원장차수 생성
     */
    private LedgerOrdersGenerateResponseDto createFirstLedgerOrder() {
        log.info("첫 번째 원장차수 생성");
        
        int currentYear = Year.now().getValue();
        String firstTitle = String.format("%d-001", currentYear);
        
        LedgerOrders newOrder = LedgerOrders.builder()
                .ledgerOrdersTitle(firstTitle)
                .ledgerOrdersStatusCd("P1")
                .build();

        LedgerOrders savedOrder = ledgerOrdersRepository.save(newOrder);
        log.info("첫 번째 원장차수 생성 완료: ID={}, Title={}", savedOrder.getLedgerOrdersId(), savedOrder.getLedgerOrdersTitle());

        return LedgerOrdersGenerateResponseDto.builder()
                .ledgerOrdersId(savedOrder.getLedgerOrdersId())
                .ledgerOrdersTitle(savedOrder.getLedgerOrdersTitle())
                .ledgerOrdersStatusCd(savedOrder.getLedgerOrdersStatusCd())
                .previousTitle("없음")
                .message(String.format("첫 번째 책무번호 '%s'가 생성되었습니다.", savedOrder.getLedgerOrdersTitle()))
                .build();
    }

    /**
     * 원장차수 제목으로 ledger_orders_id 조회
     */
    @Override
    @Transactional(readOnly = true)
    public Long getLedgerOrdersIdByTitle(String title) {
        log.info("원장차수 ID 조회 요청: title={}", title);
        
        if (title == null || title.trim().isEmpty()) {
            throw new BusinessException("원장차수 제목이 비어있습니다.", "EMPTY_TITLE");
        }
        
        Optional<LedgerOrders> ledgerOrderOpt = ledgerOrdersRepository.findByLedgerOrdersTitle(title.trim());
        
        if (ledgerOrderOpt.isEmpty()) {
            log.warn("해당 제목의 원장차수가 존재하지 않음: {}", title);
            throw new BusinessException(
                String.format("제목 '%s'에 해당하는 원장차수가 존재하지 않습니다.", title), 
                "LEDGER_ORDER_NOT_FOUND"
            );
        }
        
        LedgerOrders ledgerOrder = ledgerOrderOpt.get();
        log.info("원장차수 ID 조회 완료: title={}, id={}", title, ledgerOrder.getLedgerOrdersId());
        
        return ledgerOrder.getLedgerOrdersId();
    }

    /**
     * 원장차수 확정 처리 (상태를 P2로 변경)
     */
    @Override
    @Transactional
    public String confirmLedgerOrder(String ledgerOrderValue) {
        log.info("원장차수 확정 처리 요청: ledgerOrderValue={}", ledgerOrderValue);

        if (ledgerOrderValue == null || ledgerOrderValue.trim().isEmpty()) {
            throw new BusinessException("원장차수 값이 비어있습니다.", "EMPTY_LEDGER_ORDER_VALUE");
        }

        // 1. 해당 원장차수 조회
        Optional<LedgerOrders> ledgerOrderOpt = ledgerOrdersRepository.findByLedgerOrdersTitle(ledgerOrderValue.trim());
        
        if (ledgerOrderOpt.isEmpty()) {
            log.warn("해당 원장차수가 존재하지 않음: {}", ledgerOrderValue);
            throw new BusinessException(
                String.format("원장차수 '%s'가 존재하지 않습니다.", ledgerOrderValue), 
                "LEDGER_ORDER_NOT_FOUND"
            );
        }

        LedgerOrders ledgerOrder = ledgerOrderOpt.get();
        log.info("원장차수 조회 완료: ID={}, Title={}, Status={}", 
                ledgerOrder.getLedgerOrdersId(), 
                ledgerOrder.getLedgerOrdersTitle(), 
                ledgerOrder.getLedgerOrdersStatusCd());

        // 2. 현재 상태가 P1(신규)인지 확인
        if (!"P1".equals(ledgerOrder.getLedgerOrdersStatusCd())) {
            throw new BusinessException(
                String.format("신규 상태의 원장차수만 확정할 수 있습니다. 현재 상태: %s", 
                    ledgerOrder.getLedgerOrdersStatusCd()), 
                "INVALID_STATUS_FOR_CONFIRM"
            );
        }

        // 3. 상태를 P2(확정)로 업데이트
        ledgerOrder.updateStatusCd("P2");
        LedgerOrders updatedOrder = ledgerOrdersRepository.save(ledgerOrder);
        
        log.info("원장차수 확정 처리 완료: ID={}, Title={}, Status={} -> {}", 
                updatedOrder.getLedgerOrdersId(), 
                updatedOrder.getLedgerOrdersTitle(), 
                "P1", 
                updatedOrder.getLedgerOrdersStatusCd());

        return String.format("원장차수 '%s'가 확정되었습니다.", ledgerOrderValue);
    }

    /**
     * 원장차수 확정취소 처리 (상태를 P1로 변경)
     */
    @Override
    @Transactional
    public String cancelConfirmLedgerOrder(String ledgerOrderValue) {
        log.info("원장차수 확정취소 처리 요청: ledgerOrderValue={}", ledgerOrderValue);

        if (ledgerOrderValue == null || ledgerOrderValue.trim().isEmpty()) {
            throw new BusinessException("원장차수 값이 비어있습니다.", "EMPTY_LEDGER_ORDER_VALUE");
        }

        // 1. 해당 원장차수 조회
        Optional<LedgerOrders> ledgerOrderOpt = ledgerOrdersRepository.findByLedgerOrdersTitle(ledgerOrderValue.trim());
        
        if (ledgerOrderOpt.isEmpty()) {
            log.warn("해당 원장차수가 존재하지 않음: {}", ledgerOrderValue);
            throw new BusinessException(
                String.format("원장차수 '%s'가 존재하지 않습니다.", ledgerOrderValue), 
                "LEDGER_ORDER_NOT_FOUND"
            );
        }

        LedgerOrders ledgerOrder = ledgerOrderOpt.get();
        log.info("원장차수 조회 완료: ID={}, Title={}, Status={}", 
                ledgerOrder.getLedgerOrdersId(), 
                ledgerOrder.getLedgerOrdersTitle(), 
                ledgerOrder.getLedgerOrdersStatusCd());

        // 2. 현재 상태가 P2(직책확정)인지 확인
        if (!"P2".equals(ledgerOrder.getLedgerOrdersStatusCd())) {
            throw new BusinessException(
                String.format("직책확정 상태의 원장차수만 확정취소할 수 있습니다. 현재 상태: %s", 
                    ledgerOrder.getLedgerOrdersStatusCd()), 
                "INVALID_STATUS_FOR_CANCEL_CONFIRM"
            );
        }

        // 3. 상태를 P1(신규)로 업데이트
        ledgerOrder.updateStatusCd("P1");
        LedgerOrders updatedOrder = ledgerOrdersRepository.save(ledgerOrder);
        
        log.info("원장차수 확정취소 처리 완료: ID={}, Title={}, Status={} -> {}", 
                updatedOrder.getLedgerOrdersId(), 
                updatedOrder.getLedgerOrdersTitle(), 
                "P2", 
                updatedOrder.getLedgerOrdersStatusCd());

        return String.format("원장차수 '%s'가 확정취소되었습니다.", ledgerOrderValue);
    }

    @Override
    @Transactional
    public String confirmPositionResponsibility(String ledgerOrderValue) {
        log.info("직책별 책무 확정 처리 요청: ledgerOrderValue={}", ledgerOrderValue);

        if (ledgerOrderValue == null || ledgerOrderValue.trim().isEmpty()) {
            throw new BusinessException("원장차수 값이 비어있습니다.", "EMPTY_LEDGER_ORDER_VALUE");
        }

        // 1. 해당 원장차수 조회
        Optional<LedgerOrders> ledgerOrderOpt = ledgerOrdersRepository.findByLedgerOrdersTitle(ledgerOrderValue.trim());
        
        if (ledgerOrderOpt.isEmpty()) {
            log.warn("해당 원장차수가 존재하지 않음: {}", ledgerOrderValue);
            throw new BusinessException(
                String.format("원장차수 '%s'가 존재하지 않습니다.", ledgerOrderValue), 
                "LEDGER_ORDER_NOT_FOUND"
            );
        }

        LedgerOrders ledgerOrder = ledgerOrderOpt.get();
        log.info("원장차수 조회 완료: ID={}, Title={}, Status={}", 
                ledgerOrder.getLedgerOrdersId(), 
                ledgerOrder.getLedgerOrdersTitle(), 
                ledgerOrder.getLedgerOrdersStatusCd());

        // 2. 현재 상태가 P2(직책확정)인지 확인
        if (!"P2".equals(ledgerOrder.getLedgerOrdersStatusCd())) {
            throw new BusinessException(
                String.format("직책확정 상태의 원장차수만 직책별책무확정 할 수 있습니다. 현재 상태: %s", 
                    ledgerOrder.getLedgerOrdersStatusCd()), 
                "INVALID_STATUS_FOR_POSITION_RESPONSIBILITY_CONFIRM"
            );
        }

        // 3. 상태를 P3(직책별책무확정)로 업데이트
        ledgerOrder.updateStatusCd("P3");
        LedgerOrders updatedOrder = ledgerOrdersRepository.save(ledgerOrder);
        
        log.info("직책별 책무 확정 처리 완료: ID={}, Title={}, Status={} -> {}", 
                updatedOrder.getLedgerOrdersId(), 
                updatedOrder.getLedgerOrdersTitle(), 
                "P2", 
                updatedOrder.getLedgerOrdersStatusCd());

        return String.format("원장차수 '%s'의 직책별 책무가 확정되었습니다.", ledgerOrderValue);
    }

    @Override
    @Transactional
    public String cancelPositionResponsibility(String ledgerOrderValue) {
        log.info("직책별 책무 확정취소 처리 요청: ledgerOrderValue={}", ledgerOrderValue);

        if (ledgerOrderValue == null || ledgerOrderValue.trim().isEmpty()) {
            throw new BusinessException("원장차수 값이 비어있습니다.", "EMPTY_LEDGER_ORDER_VALUE");
        }

        // 1. 해당 원장차수 조회
        Optional<LedgerOrders> ledgerOrderOpt = ledgerOrdersRepository.findByLedgerOrdersTitle(ledgerOrderValue.trim());
        
        if (ledgerOrderOpt.isEmpty()) {
            log.warn("해당 원장차수가 존재하지 않음: {}", ledgerOrderValue);
            throw new BusinessException(
                String.format("원장차수 '%s'가 존재하지 않습니다.", ledgerOrderValue), 
                "LEDGER_ORDER_NOT_FOUND"
            );
        }

        LedgerOrders ledgerOrder = ledgerOrderOpt.get();
        log.info("원장차수 조회 완료: ID={}, Title={}, Status={}", 
                ledgerOrder.getLedgerOrdersId(), 
                ledgerOrder.getLedgerOrdersTitle(), 
                ledgerOrder.getLedgerOrdersStatusCd());

        // 2. 현재 상태가 P3(직책별책무확정)인지 확인
        if (!"P3".equals(ledgerOrder.getLedgerOrdersStatusCd())) {
            throw new BusinessException(
                String.format("직책별책무확정 상태의 원장차수만 확정취소할 수 있습니다. 현재 상태: %s", 
                    ledgerOrder.getLedgerOrdersStatusCd()), 
                "INVALID_STATUS_FOR_POSITION_RESPONSIBILITY_CANCEL"
            );
        }

        // 3. 상태를 P2(직책확정)로 업데이트
        ledgerOrder.updateStatusCd("P2");
        LedgerOrders updatedOrder = ledgerOrdersRepository.save(ledgerOrder);
        
        log.info("직책별 책무 확정취소 처리 완료: ID={}, Title={}, Status={} -> {}", 
                updatedOrder.getLedgerOrdersId(), 
                updatedOrder.getLedgerOrdersTitle(), 
                "P3", 
                updatedOrder.getLedgerOrdersStatusCd());

        return String.format("원장차수 '%s'의 직책별 책무 확정이 취소되었습니다.", ledgerOrderValue);
    }

    /**
     * 임원 확정 처리 (P3 → P4)
     * 
     * @param ledgerOrderValue 원장차수 값 (예: "2025-002")
     * @return 확정 처리 결과 메시지
     * @throws RuntimeException 확정 조건이 맞지 않을 때
     */
    @Override
    @Transactional
    public String confirmExecutive(String ledgerOrderValue) {
        log.info("임원 확정 처리 시작: ledgerOrderValue={}", ledgerOrderValue);

        // 1. ledgerOrderValue로 해당 원장차수 조회
        LedgerOrders ledgerOrder = ledgerOrdersRepository.findByLedgerOrdersTitle(ledgerOrderValue)
                .orElseThrow(() -> new RuntimeException(
                        String.format("원장차수 '%s'를 찾을 수 없습니다.", ledgerOrderValue)));

        // 2. 해당 원장차수의 상태가 "직책별책무확정"(P3)인지 확인
        if (!"P3".equals(ledgerOrder.getLedgerOrdersStatusCd())) {
            throw new RuntimeException(
                    String.format("직책별책무확정 상태의 원장차수만 임원 확정할 수 있습니다. 현재 상태: %s", 
                            ledgerOrder.getLedgerOrdersStatusCd()));
        }

        // 3. 상태를 P4(임원확정)로 업데이트
        ledgerOrder.updateStatusCd("P4");
        LedgerOrders updatedOrder = ledgerOrdersRepository.save(ledgerOrder);
        
        log.info("임원 확정 처리 완료: ID={}, Title={}, Status={} -> {}", 
                updatedOrder.getLedgerOrdersId(), 
                updatedOrder.getLedgerOrdersTitle(), 
                "P3", 
                updatedOrder.getLedgerOrdersStatusCd());

        return String.format("원장차수 '%s'의 임원이 확정되었습니다.", ledgerOrderValue);
    }

    /**
     * 임원 확정취소 처리 (P4 → P3)
     * 
     * @param ledgerOrderValue 원장차수 값 (예: "2025-002")
     * @return 확정취소 처리 결과 메시지
     * @throws RuntimeException 확정취소 조건이 맞지 않을 때
     */
    @Override
    @Transactional
    public String cancelExecutive(String ledgerOrderValue) {
        log.info("임원 확정취소 처리 시작: ledgerOrderValue={}", ledgerOrderValue);

        // 1. ledgerOrderValue로 해당 원장차수 조회
        LedgerOrders ledgerOrder = ledgerOrdersRepository.findByLedgerOrdersTitle(ledgerOrderValue)
                .orElseThrow(() -> new RuntimeException(
                        String.format("원장차수 '%s'를 찾을 수 없습니다.", ledgerOrderValue)));

        // 2. 해당 원장차수의 상태가 "임원확정"(P4)인지 확인
        if (!"P4".equals(ledgerOrder.getLedgerOrdersStatusCd())) {
            throw new RuntimeException(
                    String.format("임원확정 상태의 원장차수만 확정취소할 수 있습니다. 현재 상태: %s", 
                            ledgerOrder.getLedgerOrdersStatusCd()));
        }

        // 3. 상태를 P3(직책별책무확정)로 업데이트
        ledgerOrder.updateStatusCd("P3");
        LedgerOrders updatedOrder = ledgerOrdersRepository.save(ledgerOrder);
        
        log.info("임원 확정취소 처리 완료: ID={}, Title={}, Status={} -> {}", 
                updatedOrder.getLedgerOrdersId(), 
                updatedOrder.getLedgerOrdersTitle(), 
                "P4", 
                updatedOrder.getLedgerOrdersStatusCd());

        return String.format("원장차수 '%s'의 임원 확정이 취소되었습니다.", ledgerOrderValue);
    }

    /**
     * 임원 최종확정 처리 (P4 → P5)
     * 
     * @param ledgerOrderValue 원장차수 값 (예: "2025-002")
     * @return 최종확정 처리 결과 메시지
     * @throws RuntimeException 최종확정 조건이 맞지 않을 때
     */
    @Override
    @Transactional
    public String finalConfirmExecutive(String ledgerOrderValue) {
        log.info("임원 최종확정 처리 시작: ledgerOrderValue={}", ledgerOrderValue);

        // 1. ledgerOrderValue로 해당 원장차수 조회
        LedgerOrders ledgerOrder = ledgerOrdersRepository.findByLedgerOrdersTitle(ledgerOrderValue)
                .orElseThrow(() -> new RuntimeException(
                        String.format("원장차수 '%s'를 찾을 수 없습니다.", ledgerOrderValue)));

        // 2. 해당 원장차수의 상태가 "임원확정"(P4)인지 확인
        if (!"P4".equals(ledgerOrder.getLedgerOrdersStatusCd())) {
            throw new RuntimeException(
                    String.format("임원확정 상태의 원장차수만 최종확정할 수 있습니다. 현재 상태: %s", 
                            ledgerOrder.getLedgerOrdersStatusCd()));
        }

        // 3. 상태를 P5(최종확정)로 업데이트
        ledgerOrder.updateStatusCd("P5");
        LedgerOrders updatedOrder = ledgerOrdersRepository.save(ledgerOrder);
        
        log.info("임원 최종확정 처리 완료: ID={}, Title={}, Status={} -> {}", 
                updatedOrder.getLedgerOrdersId(), 
                updatedOrder.getLedgerOrdersTitle(), 
                "P4", 
                updatedOrder.getLedgerOrdersStatusCd());

        return String.format("원장차수 '%s'의 임원이 최종확정되었습니다.", ledgerOrderValue);
    }

    /**
     * 다음 차수 제목 생성
     * 
     * @param currentTitle 현재 차수 제목 (예: "2024-004")
     * @return 다음 차수 제목 (예: "2025-001" 또는 "2024-005")
     */
    private String generateNextTitle(String currentTitle) {
        if (currentTitle == null || currentTitle.trim().isEmpty()) {
            int currentYear = Year.now().getValue();
            return String.format("%d-001", currentYear);
        }

        // 정규식으로 연도와 차수 파싱 (YYYY-NNN 형식)
        Pattern pattern = Pattern.compile("^(\\d{4})-(\\d{3})$");
        Matcher matcher = pattern.matcher(currentTitle.trim());
        
        if (!matcher.matches()) {
            log.warn("예상과 다른 차수 제목 형식: {}", currentTitle);
            int currentYear = Year.now().getValue();
            return String.format("%d-001", currentYear);
        }

        int titleYear = Integer.parseInt(matcher.group(1));
        int titleSequence = Integer.parseInt(matcher.group(2));
        int currentYear = Year.now().getValue();

        log.info("차수 파싱 결과: 제목연도={}, 제목차수={}, 현재연도={}", titleYear, titleSequence, currentYear);

        if (titleYear == currentYear) {
            // 같은 연도: 차수 증가
            int nextSequence = titleSequence + 1;
            String nextTitle = String.format("%d-%03d", currentYear, nextSequence);
            log.info("같은 연도 차수 증가: {} → {}", currentTitle, nextTitle);
            return nextTitle;
        } else {
            // 다른 연도 (주로 신년도): 새 연도 001로 시작
            String nextTitle = String.format("%d-001", currentYear);
            log.info("신년도 차수 생성: {} → {}", currentTitle, nextTitle);
            return nextTitle;
        }
    }
}