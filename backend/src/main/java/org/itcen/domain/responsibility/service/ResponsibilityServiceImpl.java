package org.itcen.domain.responsibility.service;

import java.util.List;
import java.util.stream.Collectors;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.responsibility.dto.ResponsibilityCreateRequestDto;
import org.itcen.domain.responsibility.dto.ResponsibilityDetailDto;
import org.itcen.domain.responsibility.dto.ResponsibilityDetailResponseDto;
import org.itcen.domain.responsibility.dto.ResponsibilityResponseDto;
import org.itcen.domain.responsibility.dto.ResponsibilityStatusDto;
import org.itcen.domain.responsibility.entity.Responsibility;
import org.itcen.domain.responsibility.entity.ResponsibilityDetail;
import org.itcen.domain.responsibility.repository.ResponsibilityDetailRepository;
import org.itcen.domain.responsibility.repository.ResponsibilityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResponsibilityServiceImpl implements ResponsibilityService {

    private final ResponsibilityRepository responsibilityRepository;
    private final ResponsibilityDetailRepository responsibilityDetailRepository;

    @Override
    @Transactional
    public Responsibility createResponsibility(ResponsibilityCreateRequestDto requestDto) {

        Responsibility responsibility = Responsibility.builder()
                .responsibilityContent(requestDto.getResponsibilityContent()).build();
        Responsibility savedResponsibility = responsibilityRepository.save(responsibility);

        for (ResponsibilityDetailDto detailDto : requestDto.getDetails()) {
            ResponsibilityDetail detail =
                    ResponsibilityDetail.builder().responsibility(savedResponsibility)
                            .responsibilityDetailContent(detailDto.getResponsibilityDetailContent())
                            .responsibilityMgtSts(detailDto.getKeyManagementTasks())
                            .responsibilityRelEvid(detailDto.getRelatedBasis()).build();

            responsibilityDetailRepository.save(detail);
        }

        return savedResponsibility;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResponsibilityStatusDto> getResponsibilityStatusList(Long responsibilityId) {
        if (responsibilityId != null) {
            return responsibilityDetailRepository
                    .findResponsibilityStatusListById(responsibilityId);
        }
        return responsibilityDetailRepository.findResponsibilityStatusList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResponsibilityResponseDto getResponsibilityById(Long id) {
        Responsibility responsibility = responsibilityRepository.findById(id)
                .orElseThrow(() -> new BusinessException("책무를 찾을 수 없습니다. ID: " + id));

        List<ResponsibilityDetail> details =
                responsibilityDetailRepository.findAllByResponsibilityId(id);

        List<ResponsibilityDetailResponseDto> detailDtos = details.stream()
                .map(detail -> ResponsibilityDetailResponseDto.builder().id(detail.getId())
                        .responsibilityDetailContent(detail.getResponsibilityDetailContent())
                        .keyManagementTasks(detail.getResponsibilityMgtSts())
                        .relatedBasis(detail.getResponsibilityRelEvid()).build())
                .collect(Collectors.toList());

        return ResponsibilityResponseDto.builder().id(responsibility.getId())
                .responsibilityContent(responsibility.getResponsibilityContent())
                .details(detailDtos).build();
    }

    @Override
    @Transactional
    public Responsibility updateResponsibility(Long id, ResponsibilityCreateRequestDto requestDto) {
        Responsibility responsibility = responsibilityRepository.findById(id)
                .orElseThrow(() -> new BusinessException("수정할 책무를 찾을 수 없습니다. ID: " + id));

        responsibility.setResponsibilityContent(requestDto.getResponsibilityContent());

        // 기존 상세 정보 삭제
        List<ResponsibilityDetail> existingDetails =
                responsibilityDetailRepository.findAllByResponsibilityId(id);
        responsibilityDetailRepository.deleteAll(existingDetails);

        // 새로운 상세 정보 추가
        for (ResponsibilityDetailDto detailDto : requestDto.getDetails()) {
            ResponsibilityDetail newDetail =
                    ResponsibilityDetail.builder().responsibility(responsibility)
                            .responsibilityDetailContent(detailDto.getResponsibilityDetailContent())
                            .responsibilityMgtSts(detailDto.getKeyManagementTasks())
                            .responsibilityRelEvid(detailDto.getRelatedBasis()).build();

            responsibilityDetailRepository.save(newDetail);
        }

        return responsibility;
    }
}
