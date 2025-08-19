package org.itcen.domain.responsibility.service;

import org.itcen.domain.responsibility.dto.ResponsibilityCreateRequestDto;
import org.itcen.domain.responsibility.dto.ResponsibilityDetailSelectDto;
import org.itcen.domain.responsibility.dto.ResponsibilityResponseDto;
import org.itcen.domain.responsibility.dto.ResponsibilityStatusDto;
import org.itcen.domain.responsibility.entity.Responsibility;

import java.util.List;

public interface ResponsibilityService {
    Responsibility createResponsibility(ResponsibilityCreateRequestDto requestDto);

    List<ResponsibilityStatusDto> getResponsibilityStatusList(Long responsibilityId, Long ledgerOrdersId);

    List<ResponsibilityResponseDto> getResponsibilityById(Long id);

    Responsibility updateResponsibility(Long id, ResponsibilityCreateRequestDto requestDto);

    void deleteResponsibility(Long id);
}
