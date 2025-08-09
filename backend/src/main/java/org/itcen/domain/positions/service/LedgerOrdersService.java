package org.itcen.domain.positions.service;

import org.itcen.domain.positions.dto.LedgerOrdersGenerateResponseDto;
import org.itcen.domain.positions.dto.LedgerOrdersStatusCheckDto;

/**
 * 원장차수 Service 인터페이스
 * 
 * 원장차수 관련 비즈니스 로직을 정의합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 원장차수 비즈니스 로직만 담당
 * - Open/Closed: 새로운 기능 추가 시 확장 가능
 * - Liskov Substitution: 구현체가 이 인터페이스를 올바르게 구현
 * - Interface Segregation: 필요한 기능만 정의
 * - Dependency Inversion: 구체적인 구현이 아닌 인터페이스에 의존
 */
public interface LedgerOrdersService {

    /**
     * 현재 원장차수 상태 확인
     * 
     * 로직:
     * 1. ledger_orders 테이블의 최대 ID 레코드 조회
     * 2. 해당 레코드의 status_cd 확인
     * 3. 생성 가능 여부 반환 (P5 상태일 때만 가능)
     * 
     * @return 현재 상태 및 생성 가능 여부
     */
    LedgerOrdersStatusCheckDto checkGenerationStatus();

    /**
     * 새로운 책무번호(원장차수) 생성
     * 
     * 로직:
     * 1. ledger_orders 테이블의 최대 ID 레코드 조회
     * 2. 해당 레코드의 status_cd가 "P5"인지 확인
     * 3. "P5"가 아니면 예외 발생
     * 4. "P5"이면 새로운 차수 생성
     *    - 현재 연도와 비교하여 연도별 차수 결정
     *    - 같은 연도: 차수 증가 (001 → 002)
     *    - 다른 연도: 새 연도로 001부터 시작
     * 5. 새 레코드 INSERT (status_cd = "P1")
     * 
     * @return 생성된 원장차수 정보
     * @throws RuntimeException 생성 조건이 맞지 않을 때
     */
    LedgerOrdersGenerateResponseDto generateNewLedgerOrder();

    /**
     * 원장차수 제목으로 ledger_orders_id 조회
     * 
     * 로직:
     * 1. ledger_orders 테이블에서 title로 검색
     * 2. 해당하는 레코드의 ledger_orders_id 반환
     * 3. 존재하지 않으면 예외 발생
     * 
     * @param title 원장차수 제목 (예: "2025-002")
     * @return ledger_orders_id
     * @throws RuntimeException 해당 제목의 원장차수가 존재하지 않을 때
     */
    Long getLedgerOrdersIdByTitle(String title);

    /**
     * 원장차수 확정 처리 (상태를 P2로 변경)
     * 
     * 로직:
     * 1. ledgerOrderValue로 해당 원장차수 조회
     * 2. 해당 원장차수의 상태가 "신규"(P1)인지 확인
     * 3. 상태를 P2(확정)로 업데이트
     * 4. 성공 메시지 반환
     * 
     * @param ledgerOrderValue 원장차수 값 (예: "2025-002")
     * @return 확정 처리 결과 메시지
     * @throws RuntimeException 확정 조건이 맞지 않을 때
     */
    String confirmLedgerOrder(String ledgerOrderValue);

    /**
     * 원장차수 확정취소 처리 (상태를 P1로 변경)
     * 
     * 로직:
     * 1. ledgerOrderValue로 해당 원장차수 조회
     * 2. 해당 원장차수의 상태가 "직책확정"(P2)인지 확인
     * 3. 상태를 P1(신규)로 업데이트
     * 4. 성공 메시지 반환
     * 
     * @param ledgerOrderValue 원장차수 값 (예: "2025-002")
     * @return 확정취소 처리 결과 메시지
     * @throws RuntimeException 확정취소 조건이 맞지 않을 때
     */
    String cancelConfirmLedgerOrder(String ledgerOrderValue);

    /**
     * 직책별 책무 확정 처리 (P2 → P3)
     * 
     * 로직:
     * 1. ledgerOrderValue로 해당 원장차수 조회
     * 2. 해당 원장차수의 상태가 "직책확정"(P2)인지 확인
     * 3. 상태를 P3(직책별책무확정)로 업데이트
     * 4. 성공 메시지 반환
     * 
     * @param ledgerOrderValue 원장차수 값 (예: "2025-002")
     * @return 확정 처리 결과 메시지
     * @throws RuntimeException 확정 조건이 맞지 않을 때
     */
    String confirmPositionResponsibility(String ledgerOrderValue);

    /**
     * 직책별 책무 확정취소 처리 (P3 → P2)
     * 
     * 로직:
     * 1. ledgerOrderValue로 해당 원장차수 조회
     * 2. 해당 원장차수의 상태가 "직책별책무확정"(P3)인지 확인
     * 3. 상태를 P2(직책확정)로 업데이트
     * 4. 성공 메시지 반환
     * 
     * @param ledgerOrderValue 원장차수 값 (예: "2025-002")
     * @return 확정취소 처리 결과 메시지
     * @throws RuntimeException 확정취소 조건이 맞지 않을 때
     */
    String cancelPositionResponsibility(String ledgerOrderValue);

    /**
     * 임원 확정 처리 (P3 → P4)
     * 
     * 로직:
     * 1. ledgerOrderValue로 해당 원장차수 조회
     * 2. 해당 원장차수의 상태가 "직책별책무확정"(P3)인지 확인
     * 3. 상태를 P4(임원확정)로 업데이트
     * 4. 성공 메시지 반환
     * 
     * @param ledgerOrderValue 원장차수 값 (예: "2025-002")
     * @return 확정 처리 결과 메시지
     * @throws RuntimeException 확정 조건이 맞지 않을 때
     */
    String confirmExecutive(String ledgerOrderValue);

    /**
     * 임원 확정취소 처리 (P4 → P3)
     * 
     * 로직:
     * 1. ledgerOrderValue로 해당 원장차수 조회
     * 2. 해당 원장차수의 상태가 "임원확정"(P4)인지 확인
     * 3. 상태를 P3(직책별책무확정)로 업데이트
     * 4. 성공 메시지 반환
     * 
     * @param ledgerOrderValue 원장차수 값 (예: "2025-002")
     * @return 확정취소 처리 결과 메시지
     * @throws RuntimeException 확정취소 조건이 맞지 않을 때
     */
    String cancelExecutive(String ledgerOrderValue);

    /**
     * 임원 최종확정 처리 (P4 → P5)
     * 
     * 로직:
     * 1. ledgerOrderValue로 해당 원장차수 조회
     * 2. 해당 원장차수의 상태가 "임원확정"(P4)인지 확인
     * 3. 상태를 P5(최종확정)로 업데이트
     * 4. 성공 메시지 반환
     * 
     * @param ledgerOrderValue 원장차수 값 (예: "2025-002")
     * @return 최종확정 처리 결과 메시지
     * @throws RuntimeException 최종확정 조건이 맞지 않을 때
     */
    String finalConfirmExecutive(String ledgerOrderValue);
}