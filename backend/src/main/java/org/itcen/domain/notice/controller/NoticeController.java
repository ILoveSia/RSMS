package org.itcen.domain.notice.controller;

import lombok.RequiredArgsConstructor;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.notice.dto.NoticeDetailResponseDto;
import org.itcen.domain.notice.dto.NoticeListResponseDto;
import org.itcen.domain.notice.service.NoticeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notice")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NoticeListResponseDto>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort sortSpec = Sort.by("DESC".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC, sort);
        Pageable pageable = PageRequest.of(page, size, sortSpec);
        Page<NoticeListResponseDto> data = noticeService.getNoticeList(pageable);
        return ResponseEntity.ok(ApiResponse.success("공지사항 목록 조회 완료", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticeDetailResponseDto>> detail(@PathVariable Long id) {
        NoticeDetailResponseDto data = noticeService.getNoticeDetailAndIncreaseView(id);
        return ResponseEntity.ok(ApiResponse.success("공지사항 상세 조회 완료", data));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Long>> create(
            @RequestBody org.itcen.domain.notice.dto.NoticeCreateRequestDto req,
            @RequestHeader(value = "X-User-Id", defaultValue = "system") String userId
    ) {
        Long id = noticeService.createNotice(req, userId);
        return ResponseEntity.ok(ApiResponse.success("공지사항 등록 완료", id));
    }
}


