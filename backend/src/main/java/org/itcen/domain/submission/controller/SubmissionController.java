package org.itcen.domain.submission.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.submission.dto.SubmissionDto;
import org.itcen.domain.submission.dto.SubmissionCreateRequest;
import org.itcen.domain.submission.service.SubmissionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/submissions")
@RequiredArgsConstructor
public class SubmissionController {
    private final SubmissionService submissionService;

    @PostMapping
    public ApiResponse<SubmissionDto> create(
            HttpServletRequest request,
            @RequestBody SubmissionCreateRequest createRequest) {
        
        
        SubmissionDto dto = SubmissionDto.builder()
                .submitHistCd(createRequest.getSubmitHistCd())
                .execofficerId(createRequest.getExecofficerId())
                .rmSubmitDt(createRequest.getRmSubmitDt() != null ? createRequest.getRmSubmitDt() : LocalDate.now())
                .updateYn(createRequest.getUpdateYn() != null ? createRequest.getUpdateYn() : "N")
                .rmSubmitRemarks(createRequest.getRmSubmitRemarks())
                .positionsId(createRequest.getPositionsId())
                .bankCd(createRequest.getBankCd())
                .createdId("system") // TODO: 실제 로그인 사용자 ID로 변경
                .updatedId("system") // TODO: 실제 로그인 사용자 ID로 변경
                .createdAt(java.time.LocalDateTime.now())
                .updatedAt(java.time.LocalDateTime.now())
                // 프론트엔드 호환성을 위한 필드들 (deprecated)
                .historyCode(createRequest.getHistoryCode())
                .executiveName(createRequest.getExecutiveName())
                .position(createRequest.getPosition())
                .submissionDate(createRequest.getSubmissionDate())
                .remarks(createRequest.getRemarks())
                .attachmentFile(createRequest.getAttachmentFile())
                .build();
        
        return ApiResponse.success(submissionService.createSubmission(dto));
    }

    @PutMapping("/{id}")
    public ApiResponse<SubmissionDto> update(@PathVariable Long id, @RequestBody SubmissionDto dto) {
        return ApiResponse.success(submissionService.updateSubmission(id, dto));
    }

    @GetMapping("/{id}")
    public ApiResponse<SubmissionDto> get(@PathVariable Long id) {
        return ApiResponse.success(submissionService.getSubmission(id));
    }
    
    /**
     * 제출 이력 조회 (positions 테이블과 조인)
     */
    @GetMapping("/history")
    public ApiResponse<List<SubmissionDto>> getSubmissionHistory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String ledgerOrder) {
        
        List<SubmissionDto> submissions = submissionService.getSubmissionHistoryWithPositions(startDate, endDate, ledgerOrder);
        return ApiResponse.success(submissions);
    }
    
    /**
     * 제출 이력 일괄 삭제
     */
    @DeleteMapping("/history")
    public ApiResponse<Void> deleteSubmissionHistory(@RequestBody List<Long> ids) {
        submissionService.deleteSubmissions(ids);
        return ApiResponse.success("제출 이력이 성공적으로 삭제되었습니다.");
    }
}
