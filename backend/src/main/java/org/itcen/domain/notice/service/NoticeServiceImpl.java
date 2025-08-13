package org.itcen.domain.notice.service;

import lombok.RequiredArgsConstructor;
import org.itcen.domain.notice.dto.NoticeListResponseDto;
import org.itcen.domain.notice.dto.NoticeDetailResponseDto;
import org.itcen.domain.notice.dto.NoticeCreateRequestDto;
import org.itcen.domain.notice.entity.Notice;
import org.itcen.domain.notice.repository.NoticeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {

    private final NoticeRepository noticeRepository;

    @Override
    public Page<NoticeListResponseDto> getNoticeList(Pageable pageable) {
        Page<Notice> page = noticeRepository.findAll(pageable);
        return page.map(NoticeListResponseDto::from);
    }

    @Override
    @Transactional
    public NoticeDetailResponseDto getNoticeDetailAndIncreaseView(Long id) {
        noticeRepository.incrementViewCount(id);
        Notice notice = noticeRepository.findById(id).orElseThrow();
        return NoticeDetailResponseDto.from(notice);
    }

    @Override
    @Transactional
    public Long createNotice(NoticeCreateRequestDto req, String userId) {
        Notice notice = Notice.builder()
                .category(req.getCategory())
                .title(req.getTitle())
                .content(req.getContent())
                .pinned(Boolean.TRUE.equals(req.getPinned()))
                .viewCount(0)
                .build();
        // BaseEntity의 createdId/updatedId는 Auditing에서 설정되지만, 명시적으로 지정 가능
        notice.setCreatedId(userId);
        notice.setUpdatedId(userId);
        Notice saved = noticeRepository.save(notice);
        return saved.getId();
    }
}


