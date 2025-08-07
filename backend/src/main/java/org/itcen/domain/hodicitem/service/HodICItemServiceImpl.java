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
    public List<HodICItemStatusProjection> getHodICItemStatusList(Long ledgerOrders, String fieldType) {
        List<HodICItemStatusProjection> resultList = hodICItemRepository.findHodICItemStatusList(ledgerOrders, fieldType);
        return resultList;
    }

    @Override
    public HodICItemResponseDto getHodICItemById(Long hodIcItemId) {
        HodICItem hodICItem = hodICItemRepository.findById(hodIcItemId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 부서장 내부통제 항목입니다. ID: " + hodIcItemId));

        HodICItemResponseDto responseDto = HodICItemResponseDto.from(hodICItem);
        return responseDto;
    }

    @Override
    @Transactional
    public Long createHodICItem(HodICItemCreateRequestDto createRequest, String currentUserId) {
        // 책무 존재 여부 확인
        responsibilityRepository.findById(createRequest.getResponsibilityId())
                .orElseThrow(() -> new BusinessException("존재하지 않는 책무입니다. ID: " + createRequest.getResponsibilityId()));

        // 엔티티 생성
        HodICItem hodICItem = HodICItem.builder()
                .responsibilityId(createRequest.getResponsibilityId())
                .responsibilityDetailId(createRequest.getResponsibilityDetailId())
                .ledgerOrders(createRequest.getLedgerOrders())
                .orderStatus(createRequest.getOrderStatus())
                .dateExpired(createRequest.getDateExpired())
                .fieldTypeCd(createRequest.getFieldTypeCd())
                .roleTypeCd(createRequest.getRoleTypeCd())
                .deptCd(createRequest.getDeptCd())
                .icTask(createRequest.getIcTask())
                .measureId(createRequest.getMeasureId())
                .measureDesc(createRequest.getMeasureDesc())
                .measureType(createRequest.getMeasureType())
                .periodCd(createRequest.getPeriodCd())
                .supportDoc(createRequest.getSupportDoc())
                .checkPeriod(createRequest.getCheckPeriod())
                .checkWay(createRequest.getCheckWay())
                .proofDoc(createRequest.getProofDoc())
                .build();

        HodICItem savedHodICItem = hodICItemRepository.save(hodICItem);
        return savedHodICItem.getHodIcItemId();
    }

    @Override
    @Transactional
    public HodICItemResponseDto updateHodICItem(Long hodIcItemId, HodICItemCreateRequestDto updateRequest, String currentUserId) {
        HodICItem hodICItem = hodICItemRepository.findById(hodIcItemId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 부서장 내부통제 항목입니다. ID: " + hodIcItemId));

        // 책무 존재 여부 확인
        responsibilityRepository.findById(updateRequest.getResponsibilityId())
                .orElseThrow(() -> new BusinessException("존재하지 않는 책무입니다. ID: " + updateRequest.getResponsibilityId()));

        // 엔티티 업데이트
        hodICItem.setResponsibilityId(updateRequest.getResponsibilityId());
        hodICItem.setResponsibilityDetailId(updateRequest.getResponsibilityDetailId());
        hodICItem.setLedgerOrders(updateRequest.getLedgerOrders());
        hodICItem.setOrderStatus(updateRequest.getOrderStatus());
        hodICItem.setDateExpired(updateRequest.getDateExpired());
        hodICItem.setFieldTypeCd(updateRequest.getFieldTypeCd());
        hodICItem.setRoleTypeCd(updateRequest.getRoleTypeCd());
        hodICItem.setDeptCd(updateRequest.getDeptCd());
        hodICItem.setIcTask(updateRequest.getIcTask());
        hodICItem.setMeasureId(updateRequest.getMeasureId());
        hodICItem.setMeasureDesc(updateRequest.getMeasureDesc());
        hodICItem.setMeasureType(updateRequest.getMeasureType());
        hodICItem.setPeriodCd(updateRequest.getPeriodCd());
        hodICItem.setSupportDoc(updateRequest.getSupportDoc());
        hodICItem.setCheckPeriod(updateRequest.getCheckPeriod());
        hodICItem.setCheckWay(updateRequest.getCheckWay());
        hodICItem.setProofDoc(updateRequest.getProofDoc());

        HodICItem updatedHodICItem = hodICItemRepository.save(hodICItem);
        return HodICItemResponseDto.from(updatedHodICItem);
    }

    @Override
    @Transactional
    public void deleteHodICItem(Long hodIcItemId, String currentUserId) {
        HodICItem hodICItem = hodICItemRepository.findById(hodIcItemId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 부서장 내부통제 항목입니다. ID: " + hodIcItemId));

        // 결재 진행 중인 경우 삭제 불가
        if (hodICItem.getApprovalId() != null) {
            throw new BusinessException("결재 진행 중인 항목은 삭제할 수 없습니다.");
        }

        hodICItemRepository.delete(hodICItem);
    }

    @Override
    @Transactional
    public Long requestApproval(Long hodIcItemId, String currentUserId) {
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
        return approvalId;
    }

    @Override
    @Transactional
    public void deleteMultipleHodICItems(List<Long> hodIcItemIds, String currentUserId) {
        for (Long hodIcItemId : hodIcItemIds) {
            try {
                deleteHodICItem(hodIcItemId, currentUserId);
            } catch (Exception e) {
                log.warn("부서장 내부통제 항목 삭제 실패: ID={}, 오류={}", hodIcItemId, e.getMessage());
                // 개별 삭제 실패는 로그만 남기고 계속 진행
            }
        }
    }

    @Override
    public boolean isCreatedBy(Long hodIcItemId, String currentUserId) {
        HodICItem hodICItem = hodICItemRepository.findById(hodIcItemId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 부서장 내부통제 항목입니다. ID: " + hodIcItemId));

        return currentUserId.equals(hodICItem.getCreatedId());
    }
}
