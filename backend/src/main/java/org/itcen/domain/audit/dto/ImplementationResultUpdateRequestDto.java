package org.itcen.domain.audit.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 이행결과 업데이트 요청 DTO
 * 
 * 단일 책임 원칙(SRP): 이행결과 업데이트 데이터 전송만 담당
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImplementationResultUpdateRequestDto {

    /**
     * 점검 계획관리 상세 ID
     */
    @NotNull(message = "점검 계획관리 상세 ID는 필수입니다")
    private Long auditProgMngtDetailId;

    /**
     * 이행결과 내용
     */
    @NotNull(message = "이행결과 내용은 필수입니다")
    @Size(min = 1, max = 4000, message = "이행결과 내용은 1자 이상 4000자 이하여야 합니다")
    private String auditDoneContent;
}