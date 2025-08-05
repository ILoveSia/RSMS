package org.itcen.domain.audit.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.audit.dto.HodIcItemDto;
import org.itcen.domain.audit.service.HodIcItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 부서장 내부통제 항목 Controller
 * 
 * 단일 책임 원칙(SRP): HTTP 요청/응답 처리만 담당
 * 의존성 역전 원칙(DIP): Service 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping("/inquiry/hod-ic-items")
@RequiredArgsConstructor
public class HodIcItemController {

    private final HodIcItemService hodIcItemService;

    /**
     * 책무번호로 내부통제 항목 조회
     * 
     * @param ledgerOrdersHod 책무번호
     * @return 내부통제 항목 목록
     */
    @GetMapping
    public ResponseEntity<List<HodIcItemDto>> getItemsByLedgerOrdersHod(
            @RequestParam Long ledgerOrdersHod) {
        log.info("내부통제 항목 조회 요청 - 책무번호: {}", ledgerOrdersHod);
        
        List<HodIcItemDto> items = hodIcItemService.getItemsByLedgerOrdersHod(ledgerOrdersHod);
        
        log.info("내부통제 항목 조회 완료 - 건수: {}", items.size());
        return ResponseEntity.ok(items);
    }

    /**
     * HOD IC ITEM 상세 정보 조회
     * 점검결과작성 팝업에서 사용
     * 
     * @param hodIcItemId 부서장 내부통제 항목 ID
     * @return HOD IC ITEM 상세 정보
     */
    @GetMapping("/{hodIcItemId}/detail")
    public ResponseEntity<HodIcItemDto> getHodIcItemDetail(@PathVariable Long hodIcItemId) {
        log.info("HOD IC ITEM 상세 정보 조회 요청 - ID: {}", hodIcItemId);
        
        HodIcItemDto item = hodIcItemService.getHodIcItemById(hodIcItemId);
        
        log.info("HOD IC ITEM 상세 정보 조회 완료 - ID: {}", hodIcItemId);
        return ResponseEntity.ok(item);
    }
}