package org.itcen.domain.hodicitem.service;

import java.util.List;
import org.itcen.domain.hodicitem.dto.HodICItemCreateRequestDto;
import org.itcen.domain.hodicitem.dto.HodICItemResponseDto;
import org.itcen.domain.hodicitem.dto.HodICItemStatusProjection;

/**
 * 부서장 내부통제 항목 서비스 인터페이스
 *
 * 부서장 내부통제 항목 관련 비즈니스 로직을 정의하는 인터페이스입니다.
 *
 * SOLID 원칙: - Single Responsibility: 부서장 내부통제 항목 비즈니스 로직만 담당 - Interface Segregation: 필요한 메서드만 정의 -
 * Dependency Inversion: 구현체가 아닌 인터페이스에 의존
 */
public interface HodICItemService {

    /**
     * 부서장 내부통제 항목 현황 조회 JOIN 쿼리를 통해 관련 테이블의 정보를 함께 조회
     *
     * @param ledgerOrders 책무번호(원장차수) 필터 (null이면 전체 조회)
     * @param fieldType 항목구분 필터 (null이면 전체 조회)
     * @return 부서장 내부통제 항목 현황 목록
     */
    List<HodICItemStatusProjection> getHodICItemStatusList(Long ledgerOrders, String fieldType);

    /**
     * 부서장 내부통제 항목 상세 조회
     *
     * @param hodIcItemId 부서장 내부통제 항목 ID
     * @return 부서장 내부통제 항목 상세 정보
     */
    HodICItemResponseDto getHodICItemById(Long hodIcItemId);

    /**
     * 부서장 내부통제 항목 등록
     *
     * @param createRequest 등록 요청 데이터
     * @param currentUserId 현재 사용자 ID
     * @return 등록된 부서장 내부통제 항목 ID
     */
    Long createHodICItem(HodICItemCreateRequestDto createRequest, String currentUserId);

    /**
     * 부서장 내부통제 항목 수정
     *
     * @param hodIcItemId 부서장 내부통제 항목 ID
     * @param updateRequest 수정 요청 데이터
     * @param currentUserId 현재 사용자 ID
     * @return 수정된 부서장 내부통제 항목 정보
     */
    HodICItemResponseDto updateHodICItem(Long hodIcItemId, HodICItemCreateRequestDto updateRequest,
            String currentUserId);

    /**
     * 부서장 내부통제 항목 삭제
     *
     * @param hodIcItemId 부서장 내부통제 항목 ID
     * @param currentUserId 현재 사용자 ID
     */
    void deleteHodICItem(Long hodIcItemId, String currentUserId);

    /**
     * 결재 승인 요청 작성자ID = 로그인ID 인 경우에만 가능
     *
     * @param hodIcItemId 부서장 내부통제 항목 ID
     * @param currentUserId 현재 사용자 ID (작성자와 같아야 함)
     * @return 생성된 결재 ID
     */
    Long requestApproval(Long hodIcItemId, String currentUserId);

    /**
     * 다중 삭제
     *
     * @param hodIcItemIds 삭제할 부서장 내부통제 항목 ID 목록
     * @param currentUserId 현재 사용자 ID
     */
    void deleteMultipleHodICItems(List<Long> hodIcItemIds, String currentUserId);

    /**
     * 작성자 권한 확인 결재 승인 요청 등에서 사용
     *
     * @param hodIcItemId 부서장 내부통제 항목 ID
     * @param currentUserId 현재 사용자 ID
     * @return 작성자 여부
     */
    boolean isCreatedBy(Long hodIcItemId, String currentUserId);
}
