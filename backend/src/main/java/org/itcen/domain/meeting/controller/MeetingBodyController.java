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
     * 회의체 생성
     * 
     * @param createRequestDto 생성 요청 DTO
     * @return 생성된 회의체 정보
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MeetingBodyDto>> createMeetingBody(
            @Valid @RequestBody MeetingBodyCreateRequestDto createRequestDto) {
        
        log.info("회의체 생성 API 호출: {}", createRequestDto.getMeetingName());
        
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
        
        log.info("회의체 수정 API 호출: ID={}, 회의체명={}", meetingBodyId, updateRequestDto.getMeetingName());
        
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
        log.info("회의체 삭제 API 호출: ID={}", meetingBodyId);
        
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
        log.debug("회의체 단건 조회 API 호출: ID={}", meetingBodyId);
        
        MeetingBodyDto meetingBody = meetingBodyService.getMeetingBody(meetingBodyId);
        
        ApiResponse<MeetingBodyDto> response = ApiResponse.<MeetingBodyDto>builder()
                .success(true)
                .message("회의체 조회가 완료되었습니다.")
                .data(meetingBody)
                .build();
        
        return ResponseEntity.ok(response);
    }

    /**
     * 전체 회의체 목록 조회
     * 
     * @return 회의체 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MeetingBodyDto>>> getAllMeetingBodies() {
        log.debug("전체 회의체 목록 조회 API 호출");
        
        List<MeetingBodyDto> meetingBodies = meetingBodyService.getAllMeetingBodies();
        
        ApiResponse<List<MeetingBodyDto>> response = ApiResponse.<List<MeetingBodyDto>>builder()
                .success(true)
                .message("회의체 목록 조회가 완료되었습니다.")
                .data(meetingBodies)
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
        log.debug("구분별 회의체 목록 조회 API 호출: gubun={}", gubun);
        
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
        
        log.info("회의체 검색 API 호출 시작: gubun={}, meetingName={}, page={}, size={}", gubun, meetingName, page, size);
        
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
            
            log.info("회의체 검색 API 호출 성공: 총 {}건 조회", meetingBodies.getTotalElements());
            
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
     * 구분별 회의체 개수 조회
     * 
     * @param gubun 구분
     * @return 회의체 개수
     */
    @GetMapping("/count/gubun/{gubun}")
    public ResponseEntity<ApiResponse<Long>> countByGubun(@PathVariable String gubun) {
        log.debug("구분별 회의체 개수 조회 API 호출: gubun={}", gubun);
        
        Long count = meetingBodyService.countByGubun(gubun);
        
        ApiResponse<Long> response = ApiResponse.<Long>builder()
                .success(true)
                .message("구분별 회의체 개수 조회가 완료되었습니다.")
                .data(count)
                .build();
        
        return ResponseEntity.ok(response);
    }

    /**
     * 개최주기별 회의체 개수 조회
     * 
     * @param meetingPeriod 개최주기
     * @return 회의체 개수
     */
    @GetMapping("/count/period/{meetingPeriod}")
    public ResponseEntity<ApiResponse<Long>> countByMeetingPeriod(@PathVariable String meetingPeriod) {
        log.debug("개최주기별 회의체 개수 조회 API 호출: meetingPeriod={}", meetingPeriod);
        
        Long count = meetingBodyService.countByMeetingPeriod(meetingPeriod);
        
        ApiResponse<Long> response = ApiResponse.<Long>builder()
                .success(true)
                .message("개최주기별 회의체 개수 조회가 완료되었습니다.")
                .data(count)
                .build();
        
        return ResponseEntity.ok(response);
    }

    /**
     * 회의체명 중복 체크
     * 
     * @param meetingName 회의체명
     * @return 중복 여부
     */
    @GetMapping("/check-duplicate")
    public ResponseEntity<ApiResponse<Boolean>> checkDuplicateMeetingName(
            @RequestParam String meetingName,
            @RequestParam(required = false) String excludeId) {
        
        log.debug("회의체명 중복 체크 API 호출: meetingName={}, excludeId={}", meetingName, excludeId);
        
        boolean isDuplicate;
        if (excludeId != null) {
            isDuplicate = meetingBodyService.isDuplicateMeetingName(meetingName, excludeId);
        } else {
            isDuplicate = meetingBodyService.isDuplicateMeetingName(meetingName);
        }
        
        ApiResponse<Boolean> response = ApiResponse.<Boolean>builder()
                .success(true)
                .message("회의체명 중복 체크가 완료되었습니다.")
                .data(isDuplicate)
                .build();
        
        return ResponseEntity.ok(response);
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
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteMeetingBodies(@RequestBody List<String> ids) {
        log.info("여러 회의체 일괄 삭제 API 호출: {}건", ids.size());
        meetingBodyService.deleteMeetingBodies(ids);
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("선택한 회의체가 성공적으로 삭제되었습니다.")
                .build();
        return ResponseEntity.ok(response);
    }
}