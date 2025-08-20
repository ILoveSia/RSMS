package org.itcen.domain.meeting.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.meeting.dto.*;
import org.itcen.domain.meeting.service.MeetingBodyService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 회의체 Controller
 *
 * 회의체 관련 REST API를 제공하는 컨트롤러입니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 회의체 HTTP 요청 처리만 담당
 * - Open/Closed: 새로운 API 추가 시 확장 가능
 * - Interface Segregation: 필요한 의존성만 주입
 * - Dependency Inversion: Service 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping("/meeting-bodies")
@RequiredArgsConstructor
public class MeetingBodyController {

    private final MeetingBodyService meetingBodyService;
    /**
     * 전체 회의체 목록 조회
     *
     * @return 회의체 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MeetingBodyDto>>> getAllMeetingBodies() {
        List<MeetingBodyDto> meetingBodies = meetingBodyService.getAllMeetingBodies();

        ApiResponse<List<MeetingBodyDto>> response = ApiResponse.<List<MeetingBodyDto>>builder()
                .success(true)
                .message("회의체 목록 조회가 완료되었습니다.")
                .data(meetingBodies)
                .build();

        return ResponseEntity.ok(response);
    }
    /**
     * 회의체 생성
     *
     * @param createRequestDto 생성 요청 DTO
     * @return 생성된 회의체 정보
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MeetingBodyDto>> createMeetingBody(
            @Valid @RequestBody MeetingBodyCreateRequestDto createRequestDto) {

        MeetingBodyDto createdMeetingBody = meetingBodyService.createMeetingBody(createRequestDto);

        ApiResponse<MeetingBodyDto> response = ApiResponse.<MeetingBodyDto>builder()
                .success(true)
                .message("회의체가 성공적으로 생성되었습니다.")
                .data(createdMeetingBody)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 회의체 수정
     *
     * @param meetingBodyId 회의체 ID
     * @param updateRequestDto 수정 요청 DTO
     * @return 수정된 회의체 정보
     */
    @PutMapping("/{meetingBodyId}")
    public ResponseEntity<ApiResponse<MeetingBodyDto>> updateMeetingBody(
            @PathVariable String meetingBodyId,
            @Valid @RequestBody MeetingBodyUpdateRequestDto updateRequestDto) {

        MeetingBodyDto updatedMeetingBody = meetingBodyService.updateMeetingBody(meetingBodyId, updateRequestDto);

        ApiResponse<MeetingBodyDto> response = ApiResponse.<MeetingBodyDto>builder()
                .success(true)
                .message("회의체가 성공적으로 수정되었습니다.")
                .data(updatedMeetingBody)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * 회의체 삭제
     *
     * @param meetingBodyId 회의체 ID
     * @return 삭제 결과
     */
    @DeleteMapping("/{meetingBodyId}")
    public ResponseEntity<ApiResponse<Void>> deleteMeetingBody(@PathVariable String meetingBodyId) {
        meetingBodyService.deleteMeetingBody(meetingBodyId);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("회의체가 성공적으로 삭제되었습니다.")
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * 회의체 단건 조회
     *
     * @param meetingBodyId 회의체 ID
     * @return 회의체 정보
     */
    @GetMapping("/{meetingBodyId}")
    public ResponseEntity<ApiResponse<MeetingBodyDto>> getMeetingBody(@PathVariable String meetingBodyId) {
        MeetingBodyDto meetingBody = meetingBodyService.getMeetingBody(meetingBodyId);

        ApiResponse<MeetingBodyDto> response = ApiResponse.<MeetingBodyDto>builder()
                .success(true)
                .message("회의체 조회가 완료되었습니다.")
                .data(meetingBody)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * 구분별 회의체 목록 조회
     *
     * @param gubun 구분
     * @return 회의체 목록
     */
    @GetMapping("/gubun/{gubun}")
    public ResponseEntity<ApiResponse<List<MeetingBodyDto>>> getMeetingBodiesByGubun(@PathVariable String gubun) {
        List<MeetingBodyDto> meetingBodies = meetingBodyService.getMeetingBodiesByGubun(gubun);

        ApiResponse<List<MeetingBodyDto>> response = ApiResponse.<List<MeetingBodyDto>>builder()
                .success(true)
                .message("구분별 회의체 목록 조회가 완료되었습니다.")
                .data(meetingBodies)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * 회의체 검색 (페이징)
     *
     * @param gubun 구분 (선택)
     * @param meetingName 회의체명 (선택)
     * @param meetingPeriod 개최주기 (선택)
     * @param content 내용 (선택)
     * @param page 페이지 번호 (기본값: 0)
     * @param size 페이지 크기 (기본값: 10)
     * @param sortBy 정렬 기준 (기본값: createdAt)
     * @param sortDirection 정렬 방향 (기본값: desc)
     * @return 페이징된 회의체 목록
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<MeetingBodyDto>>> searchMeetingBodies(
            @RequestParam(required = false) String gubun,
            @RequestParam(required = false) String meetingName,
            @RequestParam(required = false) String meetingPeriod,
            @RequestParam(required = false) String content,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        try {
            MeetingBodySearchRequestDto searchRequestDto = MeetingBodySearchRequestDto.builder()
                    .gubun(gubun)
                    .meetingName(meetingName)
                    .meetingPeriod(meetingPeriod)
                    .content(content)
                    .page(page)
                    .size(size)
                    .sortBy(sortBy)
                    .sortDirection(sortDirection)
                    .build();

            Page<MeetingBodyDto> meetingBodies = meetingBodyService.searchMeetingBodies(searchRequestDto);

            ApiResponse<Page<MeetingBodyDto>> response = ApiResponse.<Page<MeetingBodyDto>>builder()
                    .success(true)
                    .message("회의체 검색이 완료되었습니다.")
                    .data(meetingBodies)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("회의체 검색 API 호출 실패: gubun={}, meetingName={}, page={}, size={}, error={}",
                    gubun, meetingName, page, size, e.getMessage(), e);

            ApiResponse<Page<MeetingBodyDto>> errorResponse = ApiResponse.<Page<MeetingBodyDto>>builder()
                    .success(false)
                    .message("회의체 검색 중 오류가 발생했습니다: " + e.getMessage())
                    .build();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    /**
     * 여러 회의체 일괄 삭제
     *
     * @param ids 삭제할 회의체 ID 리스트
     * @return 삭제 결과
     *
     * 구조적 설명:
     * - 단일 책임 원칙: 컨트롤러는 HTTP 요청만 처리, 실제 삭제 로직은 서비스에 위임
     * - 확장/폐쇄 원칙: 단건/다건 삭제 모두 지원하도록 확장
     */
    @PostMapping("/bulk-delete")
    public ResponseEntity<ApiResponse<Void>> deleteMeetingBodies(@RequestBody List<String> ids) {
        meetingBodyService.deleteMeetingBodies(ids);
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("선택한 회의체가 성공적으로 삭제되었습니다.")
                .build();
        return ResponseEntity.ok(response);
    }
}
