package org.itcen.domain.responsibility.service;

import java.util.List;
import java.util.stream.Collectors;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.responsibility.dto.ResponsibilityCreateRequestDto;
import org.itcen.domain.responsibility.dto.ResponsibilityDetailDto;
import org.itcen.domain.responsibility.dto.ResponsibilityDetailResponseDto;
import org.itcen.domain.responsibility.dto.ResponsibilityDetailSelectDto;
import org.itcen.domain.responsibility.dto.ResponsibilityResponseDto;
import org.itcen.domain.responsibility.dto.ResponsibilityStatusDto;
import org.itcen.domain.responsibility.entity.Responsibility;
import org.itcen.domain.responsibility.entity.ResponsibilityDetail;
import org.itcen.domain.responsibility.repository.ResponsibilityDetailRepository;
import org.itcen.domain.responsibility.repository.ResponsibilityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResponsibilityServiceImpl implements ResponsibilityService {

    private final ResponsibilityRepository responsibilityRepository;
    private final ResponsibilityDetailRepository responsibilityDetailRepository;

    @Override
    @Transactional
    public void deleteResponsibility(Long id) {
        responsibilityRepository.deleteById(id);
    }

    @Override
    @Transactional
    public Responsibility createResponsibility(ResponsibilityCreateRequestDto requestDto) {

        Responsibility responsibility = Responsibility.builder()
                .responsibilityContent(requestDto.getResponsibilityContent())
                .ledgerOrder(requestDto.getLedgerOrder()) // 원장차수 ID 설정
                .build();
        Responsibility savedResponsibility = responsibilityRepository.save(responsibility);

        for (ResponsibilityDetailDto detailDto : requestDto.getDetails()) {
            ResponsibilityDetail detail = ResponsibilityDetail.builder().responsibility(savedResponsibility)
                    .responsibilityDetailContent(detailDto.getResponsibilityDetailContent())
                    .responsibilityMgtSts(detailDto.getKeyManagementTasks())
                    .responsibilityRelEvid(detailDto.getRelatedBasis()).build();

            responsibilityDetailRepository.save(detail);
        }

        return savedResponsibility;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResponsibilityStatusDto> getResponsibilityStatusList(Long responsibilityId, Long ledgerOrdersId) {
        if (responsibilityId != null) {
            return responsibilityDetailRepository
                    .findResponsibilityStatusListById(responsibilityId);
        } else if (ledgerOrdersId != null) {
            return responsibilityDetailRepository
                    .findResponsibilityStatusListByLedgerOrdersId(ledgerOrdersId);
        }
        return responsibilityDetailRepository.findResponsibilityStatusList();
    }

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional(readOnly = true)
    public List<ResponsibilityResponseDto> getResponsibilityById(Long id) {
        String sql = "SELECT " +
                "r.responsibility_id, " +
                "r2.responsibility_content , " +
                "r3.responsibility_detail_content, " +
                "r3.responsibility_rel_evid, " +
                "r3.responsibility_mgt_sts " +
                "FROM responsibility r " +
                "left join responsibility r2 on r.responsibility_id = r2.responsibility_id " +
                "left join responsibility_detail r3 on r.responsibility_id = r3.responsibility_id " +
                "where r.responsibility_id =" + id + " " +
                "ORDER BY r.responsibility_id;";
        List<Object[]> results = em.createNativeQuery(sql).getResultList();
        List<ResponsibilityResponseDto> responseDtos = new ArrayList<>();
        responseDtos = results.stream().map(row -> {
            ResponsibilityResponseDto dto = new ResponsibilityResponseDto();
            dto.setId(row[0] != null ? ((Number) row[0]).longValue() : null);
            dto.setResponsibilityContent(row[1] != null ? (String) row[1] : "");
            dto.setResponsibilityDetailContent(row[2] != null ? (String) row[2] : "");
            dto.setResponsibilityRelEvid(row[3] != null ? (String) row[3] : "");
            dto.setResponsibilityMgtSts(row[4] != null ? (String) row[4] : "");
            return dto;
        }).collect(Collectors.toList());
        return responseDtos;
    }

    @Override
    @Transactional
    public Responsibility updateResponsibility(Long id, ResponsibilityCreateRequestDto requestDto) {
        Responsibility responsibility = responsibilityRepository.findById(id)
                .orElseThrow(() -> new BusinessException("수정할 책무를 찾을 수 없습니다. ID: " + id));

        responsibility.setResponsibilityContent(requestDto.getResponsibilityContent());

        // 기존 상세 정보 삭제
        List<ResponsibilityDetail> existingDetails = responsibilityDetailRepository.findAllByResponsibilityId(id);
        responsibilityDetailRepository.deleteAll(existingDetails);

        // 새로운 상세 정보 추가
        for (ResponsibilityDetailDto detailDto : requestDto.getDetails()) {
            ResponsibilityDetail newDetail = ResponsibilityDetail.builder().responsibility(responsibility)
                    .responsibilityDetailContent(detailDto.getResponsibilityDetailContent())
                    .responsibilityMgtSts(detailDto.getKeyManagementTasks())
                    .responsibilityRelEvid(detailDto.getRelatedBasis()).build();

            responsibilityDetailRepository.save(newDetail);
        }

        return responsibility;
    }
}
