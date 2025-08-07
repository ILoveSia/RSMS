package org.itcen.domain.audit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.audit.dto.HodIcItemDto;
import org.itcen.domain.audit.repository.HodIcItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 부서장 내부통제 항목 Service 구현체
 * 
 * 단일 책임 원칙(SRP): 부서장 내부통제 항목 비즈니스 로직만 담당
 * 의존성 역전 원칙(DIP): Repository 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HodIcItemServiceImpl implements HodIcItemService {

    private final HodIcItemRepository hodIcItemRepository;

    /**
     * 책무번호로 내부통제 항목 조회
     * 
     * @param ledgerOrdersHod 책무번호
     * @return 내부통제 항목 DTO 목록
     */
    @Override
    public List<HodIcItemDto> getItemsByLedgerOrdersHod(Long ledgerOrdersHod) {
        log.debug("책무번호로 내부통제 항목 조회: {}", ledgerOrdersHod);
        
        // 유효한(만료되지 않은) 항목만 조회
        return hodIcItemRepository.findActiveItemsByLedgerOrders(ledgerOrdersHod)
                .stream()
                .map(HodIcItemDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * ID로 HOD IC ITEM 상세 정보 조회
     * 
     * @param hodIcItemId 부서장 내부통제 항목 ID
     * @return HOD IC ITEM DTO
     */
    @Override
    public HodIcItemDto getHodIcItemById(Long hodIcItemId) {
        log.debug("HOD IC ITEM 상세 정보 조회: {}", hodIcItemId);
        
        return hodIcItemRepository.findById(hodIcItemId)
                .map(HodIcItemDto::fromEntity)
                .orElseThrow(() -> new RuntimeException("HOD IC ITEM을 찾을 수 없습니다: " + hodIcItemId));
    }
}