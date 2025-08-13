package org.itcen.domain.notice.service;

import org.itcen.domain.notice.dto.NoticeListResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.itcen.domain.notice.dto.NoticeDetailResponseDto;

public interface NoticeService {
    Page<NoticeListResponseDto> getNoticeList(Pageable pageable, Boolean onlyPublic);
    NoticeDetailResponseDto getNoticeDetailAndIncreaseView(Long id);
}


