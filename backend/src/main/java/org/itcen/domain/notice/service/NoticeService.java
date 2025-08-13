package org.itcen.domain.notice.service;

import org.itcen.domain.notice.dto.NoticeListResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NoticeService {
    Page<NoticeListResponseDto> getNoticeList(Pageable pageable, Boolean onlyPublic);
}


