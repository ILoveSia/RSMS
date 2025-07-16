package org.itcen.domain.hodicitem.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.hodicitem.dto.HodICItemCreateRequestDto;
import org.itcen.domain.hodicitem.dto.HodICItemResponseDto;
import org.itcen.domain.hodicitem.dto.HodICItemStatusProjection;
import org.itcen.domain.hodicitem.entity.HodICItem;
import org.itcen.domain.hodicitem.repository.HodICItemRepository;
import org.itcen.domain.responsibility.entity.Responsibility;
import org.itcen.domain.responsibility.repository.ResponsibilityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 부서장 내부통제 항목 서비스 구현체
 *
 * 부서장 내부통제 항목 관련 비즈니스 로직을 구현합니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 부서장 내부통제 항목 비즈니스 로직만 담당
 * - Open/Closed: 새로운 기능 추가 시 확장 가능
 * - Liskov Substitution: HodICItemService 인터페이스를 안전하게 구현
 * - Interface Segregation: 필요한 의존성만 주입
 * - Dependency Inversion: 구체 클래스가 아닌 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HodICItemServiceImpl implements HodICItemService {

    private final HodICItemRepository hodICItemRepository;
    private final ResponsibilityRepository responsibilityRepository;

    @Override
    public List<HodICItemStatusProjection> getHodICItemStatusList(String ledgerOrder) {
        log.debug("부서장 내부통제 항목 현황 조회 시작: ledgerOrder={}", ledgerOrder);

        List<HodICItemStatusProjection> resultList = hodICItemRepository.findHodICItemStatusList(ledgerOrder);

        log.debug("부서장 내부통제 항목 현황 조회 완료: 총 {}건", resultList.size());
        return resultList;
    }

    @Override
    public HodICItemResponseDto getHodICItemById(Long hodIcItemId) {
        log.debug("부서장 내부통제 항목 상세 조회 시작: hodIcItemId={}", hodIcItemId);

        HodICItem hodICItem = hodICItemRepository.findById(hodIcItemId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 부서장 내부통제 항목입니다. ID: " + hodIcItemId));

        HodICItemResponseDto responseDto = HodICItemResponseDto.from(hodICItem);

        log.debug("부서장 내부통제 항목 상세 조회 완료: {}", responseDto.getHodIcItemId());
        return responseDto;
    }

    @Override
    @Transactional
    public Long createHodICItem(HodICItemCreateRequestDto createRequest, String currentUserId) {
        log.debug("부서장 내부통제 항목 등록 시작: 사용자={}", currentUserId);

        // 책무 존재 여부 확인
        Responsibility responsibility = responsibilityRepository.findById(createRequest.getResponsibilityId())
                .orElseThrow(() -> new BusinessException("존재하지 않는 책무입니다. ID: " + createRequest.getResponsibilityId()));

        // 엔티티 생성
        HodICItem hodICItem = HodICItem.builder()
                .responsibilityId(createRequest.getResponsibilityId())
                .ledgerOrder(createRequest.getLedgerOrder())
                .orderStatus(createRequest.getOrderStatus())
                .dateExpired(createRequest.getDateExpired())
                .fieldTypeCd(createRequest.getFieldTypeCd())
                .roleTypeCd(createRequest.getRoleTypeCd())
                .deptCd(createRequest.getDeptCd())
                .icTask(createRequest.getIcTask())
                .measureDesc(createRequest.getMeasureDesc())
                .measureType(createRequest.getMeasureType())
                .periodCd(createRequest.getPeriodCd())
                .supportDoc(createRequest.getSupportDoc())
                .checkPeriod(createRequest.getCheckPeriod())
                .checkWay(createRequest.getCheckWay())
                .proofDoc(createRequest.getProofDoc())
                .build();

        HodICItem savedHodICItem = hodICItemRepository.save(hodICItem);

        log.info("부서장 내부통제 항목 등록 완료: ID={}", savedHodICItem.getHodIcItemId());
        return savedHodICItem.getHodIcItemId();
    }

    @Override
    @Transactional
    public HodICItemResponseDto updateHodICItem(Long hodIcItemId, HodICItemCreateRequestDto updateRequest, String currentUserId) {
        log.debug("부서장 내부통제 항목 수정 시작: hodIcItemId={}, 사용자={}", hodIcItemId, currentUserId);

        HodICItem hodICItem = hodICItemRepository.findById(hodIcItemId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 부서장 내부통제 항목입니다. ID: " + hodIcItemId));

        // 책무 존재 여부 확인
        responsibilityRepository.findById(updateRequest.getResponsibilityId())
                .orElseThrow(() -> new BusinessException("존재하지 않는 책무입니다. ID: " + updateRequest.getResponsibilityId()));

        // 엔티티 업데이트
        hodICItem.setResponsibilityId(updateRequest.getResponsibilityId());
        hodICItem.setLedgerOrder(updateRequest.getLedgerOrder());
        hodICItem.setOrderStatus(updateRequest.getOrderStatus());
        hodICItem.setDateExpired(updateRequest.getDateExpired());
        hodICItem.setFieldTypeCd(updateRequest.getFieldTypeCd());
        hodICItem.setRoleTypeCd(updateRequest.getRoleTypeCd());
        hodICItem.setDeptCd(updateRequest.getDeptCd());
        hodICItem.setIcTask(updateRequest.getIcTask());
        hodICItem.setMeasureDesc(updateRequest.getMeasureDesc());
        hodICItem.setMeasureType(updateRequest.getMeasureType());
        hodICItem.setPeriodCd(updateRequest.getPeriodCd());
        hodICItem.setSupportDoc(updateRequest.getSupportDoc());
        hodICItem.setCheckPeriod(updateRequest.getCheckPeriod());
        hodICItem.setCheckWay(updateRequest.getCheckWay());
        hodICItem.setProofDoc(updateRequest.getProofDoc());

        HodICItem updatedHodICItem = hodICItemRepository.save(hodICItem);

        log.info("부서장 내부통제 항목 수정 완료: ID={}", updatedHodICItem.getHodIcItemId());
        return HodICItemResponseDto.from(updatedHodICItem);
    }

    @Override
    @Transactional
    public void deleteHodICItem(Long hodIcItemId, String currentUserId) {
        log.debug("부서장 내부통제 항목 삭제 시작: hodIcItemId={}, 사용자={}", hodIcItemId, currentUserId);

        HodICItem hodICItem = hodICItemRepository.findById(hodIcItemId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 부서장 내부통제 항목입니다. ID: " + hodIcItemId));

        // 결재 진행 중인 경우 삭제 불가
        if (hodICItem.getApprovalId() != null) {
            throw new BusinessException("결재 진행 중인 항목은 삭제할 수 없습니다.");
        }

        hodICItemRepository.delete(hodICItem);

        log.info("부서장 내부통제 항목 삭제 완료: ID={}", hodIcItemId);
    }

    @Override
    @Transactional
    public Long requestApproval(Long hodIcItemId, String currentUserId) {
        log.debug("결재 승인 요청 시작: hodIcItemId={}, 사용자={}", hodIcItemId, currentUserId);

        HodICItem hodICItem = hodICItemRepository.findById(hodIcItemId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 부서장 내부통제 항목입니다. ID: " + hodIcItemId));

        // 작성자 권한 확인
        if (!isCreatedBy(hodIcItemId, currentUserId)) {
            throw new BusinessException("작성자만 결재 승인을 요청할 수 있습니다.");
        }

        // 이미 결재 요청된 경우 확인
        if (hodICItem.getApprovalId() != null) {
            throw new BusinessException("이미 결재 요청된 항목입니다.");
        }

        // TODO: 실제 결재 시스템과 연동
        // 여기서는 임시로 1을 반환
        Long approvalId = 1L;
        hodICItem.setApprovalId(approvalId);
        hodICItemRepository.save(hodICItem);

        log.info("결재 승인 요청 완료: hodIcItemId={}, approvalId={}", hodIcItemId, approvalId);
        return approvalId;
    }

    @Override
    @Transactional
    public void deleteMultipleHodICItems(List<Long> hodIcItemIds, String currentUserId) {
        log.debug("다중 삭제 시작: 개수={}, 사용자={}", hodIcItemIds.size(), currentUserId);

        for (Long hodIcItemId : hodIcItemIds) {
            try {
                deleteHodICItem(hodIcItemId, currentUserId);
            } catch (Exception e) {
                log.warn("부서장 내부통제 항목 삭제 실패: ID={}, 오류={}", hodIcItemId, e.getMessage());
                // 개별 삭제 실패는 로그만 남기고 계속 진행
            }
        }

        log.info("다중 삭제 완료: 총 {}개 항목 처리", hodIcItemIds.size());
    }

    @Override
    public boolean isCreatedBy(Long hodIcItemId, String currentUserId) {
        HodICItem hodICItem = hodICItemRepository.findById(hodIcItemId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 부서장 내부통제 항목입니다. ID: " + hodIcItemId));

        return currentUserId.equals(hodICItem.getCreatedId());
    }
}
