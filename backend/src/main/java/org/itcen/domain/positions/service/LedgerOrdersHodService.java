package org.itcen.domain.positions.service;

import org.itcen.domain.positions.dto.LedgerOrdersHodGenerateResponseDto;
import org.itcen.domain.positions.dto.LedgerOrdersHodSelectDto;
import org.itcen.domain.positions.entity.LedgerOrdersHod;

import java.util.List;

/**
 * 부서장 원장차수 Service 인터페이스
 * 
 * 부서장 원장차수의 비즈니스 로직을 담당하는 인터페이스입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 부서장 원장차수 비즈니스 로직만 담당
 * - Open/Closed: 새로운 기능 추가 시 확장 가능
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 구현체에 의존하지 않고 인터페이스에 의존
 */
public interface LedgerOrdersHodService {
    
    /**
     * 부서장 원장차수 SelectBox용 목록 조회
     * @return 부서장 원장차수 SelectBox용 목록
     */
    List<LedgerOrdersHodSelectDto> getLedgerOrdersHodSelectList();

    /**
     * 모든 부서장 원장차수 목록 조회
     * @return 부서장 원장차수 목록
     */
    List<LedgerOrdersHod> getAllLedgerOrdersHod();

    /**
     * 부서장 원장차수 상세 조회
     * @param id 부서장 원장차수 ID
     * @return 부서장 원장차수 상세 정보
     */
    LedgerOrdersHod getLedgerOrdersHodById(Long id);

    /**
     * 필드타입코드로 부서장 원장차수 목록 조회
     * @param fieldTypeCd 필드타입코드
     * @return 부서장 원장차수 목록
     */
    List<LedgerOrdersHod> getLedgerOrdersHodByFieldType(String fieldTypeCd);

    /**
     * 부서장 원장차수 생성
     * @param ledgerOrdersHod 생성할 부서장 원장차수 정보
     * @return 생성된 부서장 원장차수
     */
    LedgerOrdersHod createLedgerOrdersHod(LedgerOrdersHod ledgerOrdersHod);

    /**
     * 부서장 원장차수 수정
     * @param id 수정할 부서장 원장차수 ID
     * @param ledgerOrdersHod 수정할 정보
     * @return 수정된 부서장 원장차수
     */
    LedgerOrdersHod updateLedgerOrdersHod(Long id, LedgerOrdersHod ledgerOrdersHod);

    /**
     * 부서장 원장차수 삭제
     * @param id 삭제할 부서장 원장차수 ID
     */
    void deleteLedgerOrdersHod(Long id);

    /**
     * 부서장 원장차수 일괄 삭제
     * @param ids 삭제할 부서장 원장차수 ID 목록
     */
    void deleteBulkLedgerOrdersHod(List<Long> ids);

    /**
     * 부서장차수 생성
     * 
     * 로직:
     * 1. ledger_orders 테이블에서 Max ID의 ledger_orders_status_cd/ledger_orders_title 조회
     * 2. ledger_orders_status_cd = "P5" 조건 확인
     * 3. ledger_orders_hod 테이블에 새로운 레코드 생성
     *    - ledger_orders_id: Max ID 값
     *    - ledger_orders_hod_title: ledger_orders_title + "-01" (차수 증가)
     *    - ledger_orders_hod_status_cd: "P6"
     * 
     * @return 생성된 부서장 원장차수 응답 DTO
     * @throws RuntimeException P5 상태가 아니거나 생성 실패 시
     */
    LedgerOrdersHodGenerateResponseDto generateHodLedgerOrder();

    /**
     * 부서장차수 확정
     * 
     * 확정 조건:
     * 1. 해당 부서장차수의 ledger_orders_hod_status_cd가 P6이어야 함
     * 2. 해당 부서장차수(ledger_orders)에 속한 모든 HodICItem의 approvalStatus가 APPROVED이어야 함
     * 
     * 확정 처리:
     * - ledger_orders_hod_status_cd를 P6에서 P7로 업데이트
     * 
     * @param id 확정할 부서장차수 ID
     * @throws RuntimeException 확정 조건을 만족하지 않거나 처리 실패 시
     */
    void confirmHodLedgerOrder(Long id);
}