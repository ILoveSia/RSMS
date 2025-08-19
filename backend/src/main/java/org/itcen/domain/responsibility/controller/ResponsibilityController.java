package org.itcen.domain.responsibility.controller;

import lombok.RequiredArgsConstructor;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.responsibility.dto.ResponsibilityCreateRequestDto;
import org.itcen.domain.responsibility.dto.ResponsibilityDetailSelectDto;
import org.itcen.domain.responsibility.dto.ResponsibilityResponseDto;
import org.itcen.domain.responsibility.dto.ResponsibilityStatusDto;
import org.itcen.domain.responsibility.entity.Responsibility;
import org.itcen.domain.responsibility.service.ResponsibilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/responsibilities")
@RequiredArgsConstructor
public class ResponsibilityController {

    private final ResponsibilityService responsibilityService;

    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createResponsibility(@RequestBody ResponsibilityCreateRequestDto requestDto) {
        try {
            Responsibility createdResponsibility = responsibilityService.createResponsibility(requestDto);
            return ResponseEntity.ok(ApiResponse.success(createdResponsibility.getId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("책무 생성에 실패했습니다: " + e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<ResponsibilityStatusDto>>> getResponsibilityStatusList(
            @RequestParam(name = "responsibilityId", required = false) Long responsibilityId,
            @RequestParam(name = "ledgerOrdersId", required = false) Long ledgerOrdersId) {
        try {
            List<ResponsibilityStatusDto> statusList = responsibilityService.getResponsibilityStatusList(responsibilityId, ledgerOrdersId);
            return ResponseEntity.ok(ApiResponse.success(statusList));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("책무 현황 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<List<ResponsibilityResponseDto>>> getResponsibilityById(@PathVariable Long id) {
        try {
            List<ResponsibilityResponseDto> responseDto = responsibilityService.getResponsibilityById(id);
            return ResponseEntity.ok(ApiResponse.success(responseDto));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("책무 상세 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Long>> updateResponsibility(@PathVariable Long id, @RequestBody ResponsibilityCreateRequestDto requestDto) {
        try {
            Responsibility updatedResponsibility = responsibilityService.updateResponsibility(id, requestDto);
            return ResponseEntity.ok(ApiResponse.success(updatedResponsibility.getId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("책무 수정에 실패했습니다: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResponsibility(@PathVariable Long id) {
        responsibilityService.deleteResponsibility(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

}
