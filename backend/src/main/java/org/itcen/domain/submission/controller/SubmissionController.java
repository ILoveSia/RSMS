package org.itcen.domain.submission.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.submission.dto.SubmissionDto;
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
            @RequestParam(required = false) String historyCode,
            @RequestParam(required = false) String executiveName,
            @RequestParam(required = false) String position,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate submissionDate,
            @RequestParam(required = false) String remarks,
            @RequestParam(required = false) Long positionsId,
            @RequestParam(required = false) MultipartFile file) {
        
        // 모든 파라미터 로그 출력
        log.info("=== 제출 이력 등록 API 호출 ===");
        log.info("Request Content-Type: {}", request.getContentType());
        request.getParameterMap().forEach((key, values) -> {
            log.info("Parameter: {} = {}", key, String.join(", ", values));
        });
        
        log.info("제출 이력 등록 API 호출: historyCode={}, executiveName={}, position={}, submissionDate={}, positionsId={}", 
                historyCode, executiveName, position, submissionDate, positionsId);
        
        SubmissionDto dto = SubmissionDto.builder()
                .historyCode(historyCode)
                .executiveName(executiveName)
                .position(position)
                .submissionDate(submissionDate != null ? submissionDate : LocalDate.now())
                .remarks(remarks)
                .positionsId(positionsId)
                .build();
        
        if (file != null && !file.isEmpty()) {
            dto.setAttachmentFile(file.getOriginalFilename());
        }
        
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
        log.info("제출 이력 조회 API 호출: startDate={}, endDate={}, ledgerOrder={}", startDate, endDate, ledgerOrder);
        
        List<SubmissionDto> submissions = submissionService.getSubmissionHistoryWithPositions(startDate, endDate, ledgerOrder);
        return ApiResponse.success(submissions);
    }
    
    /**
     * 제출 이력 일괄 삭제
     */
    @DeleteMapping("/history")
    public ApiResponse<Void> deleteSubmissionHistory(@RequestBody List<Long> ids) {
        log.info("제출 이력 일괄 삭제 API 호출: ids={}", ids);
        submissionService.deleteSubmissions(ids);
        return ApiResponse.success("제출 이력이 성공적으로 삭제되었습니다.");
    }
}
