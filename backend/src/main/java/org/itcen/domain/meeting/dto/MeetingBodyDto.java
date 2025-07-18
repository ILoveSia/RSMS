package org.itcen.domain.meeting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 회의체 기본 DTO
 * 
 * 회의체 정보를 전송하기 위한 기본 DTO입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 회의체 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingBodyDto {

    /**
     * 회의체 ID
     */
    private String meetingBodyId;

    /**
     * 구분
     */
    private String gubun;

    /**
     * 회의체명
     */
    private String meetingName;

    /**
     * 개최주기
     */
    private String meetingPeriod;

    /**
     * 주요 심의·의결사항
     */
    private String content;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;

    /**
     * 생성자 ID
     */
    private String createdId;

    /**
     * 수정자 ID
     */
    private String updatedId;
}