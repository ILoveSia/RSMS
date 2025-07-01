package org.itcen.domain.meeting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 회의체 수정 요청 DTO
 * 
 * 회의체 수정 시 필요한 정보를 전송하기 위한 DTO입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 회의체 수정 요청 데이터 전송만 담당
 * - Open/Closed: 새로운 검증 규칙 추가 시 확장 가능
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingBodyUpdateRequestDto {



    /**
     * 구분 (필수)
     */
    @NotBlank(message = "구분은 필수입니다.")
    @Size(max = 100, message = "구분은 100자를 초과할 수 없습니다.")
    private String gubun;

    /**
     * 회의체명 (필수)
     */
    @NotBlank(message = "회의체명은 필수입니다.")
    @Size(max = 500, message = "회의체명은 500자를 초과할 수 없습니다.")
    private String meetingName;

    /**
     * 개최주기 (필수)
     */
    @NotBlank(message = "개최주기는 필수입니다.")
    @Size(max = 10, message = "개최주기는 10자를 초과할 수 없습니다.")
    private String meetingPeriod;

    /**
     * 주요 심의·의결사항 (선택)
     */
    private String content;
}