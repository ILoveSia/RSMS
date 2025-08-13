package org.itcen.domain.notice.service;

import lombok.RequiredArgsConstructor;
import org.itcen.domain.notice.dto.NoticeListResponseDto;
import org.itcen.domain.notice.entity.Notice;
import org.itcen.domain.notice.repository.NoticeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {

    private final NoticeRepository noticeRepository;

    @Override
    public Page<NoticeListResponseDto> getNoticeList(Pageable pageable, Boolean onlyPublic) {
        Page<Notice> page = Boolean.TRUE.equals(onlyPublic)
            ? noticeRepository.findByIsPublicTrue(pageable)
            : noticeRepository.findAll(pageable);
        return page.map(NoticeListResponseDto::from);
    }
}


