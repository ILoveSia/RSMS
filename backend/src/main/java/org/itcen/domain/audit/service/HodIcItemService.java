package org.itcen.domain.audit.service;

import org.itcen.domain.audit.dto.HodIcItemDto;

import java.util.List;

/**
 * 부서장 내부통제 항목 Service Interface
 * 
 * 인터페이스 분리 원칙(ISP): 필요한 메서드만 정의
 * 의존성 역전 원칙(DIP): 구현체가 아닌 인터페이스에 의존
 */
public interface HodIcItemService {

    /**
     * 책무번호로 내부통제 항목 조회
     * 
     * @param ledgerOrdersHod 책무번호
     * @return 내부통제 항목 DTO 목록
     */
    List<HodIcItemDto> getItemsByLedgerOrdersHod(Long ledgerOrdersHod);

    /**
     * ID로 HOD IC ITEM 상세 정보 조회
     * 
     * @param hodIcItemId 부서장 내부통제 항목 ID
     * @return HOD IC ITEM DTO
     */
    HodIcItemDto getHodIcItemById(Long hodIcItemId);
}