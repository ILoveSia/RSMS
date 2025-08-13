package org.itcen.domain.notice.service;

import org.itcen.domain.notice.dto.NoticeListResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.itcen.domain.notice.dto.NoticeDetailResponseDto;
import org.itcen.domain.notice.dto.NoticeCreateRequestDto;

public interface NoticeService {
    Page<NoticeListResponseDto> getNoticeList(Pageable pageable);
    NoticeDetailResponseDto getNoticeDetailAndIncreaseView(Long id);
    Long createNotice(NoticeCreateRequestDto req, String userId);
}


