package org.itcen.domain.meeting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 회의체 검색 요청 DTO
 * 
 * 회의체 검색 시 필요한 조건들을 전송하기 위한 DTO입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 회의체 검색 조건 데이터 전송만 담당
 * - Open/Closed: 새로운 검색 조건 추가 시 확장 가능
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingBodySearchRequestDto {

    /**
     * 구분 필터
     */
    private String gubun;

    /**
     * 회의체명 검색어
     */
    private String meetingName;

    /**
     * 개최주기 필터
     */
    private String meetingPeriod;

    /**
     * 내용 검색어
     */
    private String content;

    /**
     * 페이지 번호 (0부터 시작)
     */
    @Builder.Default
    private Integer page = 0;

    /**
     * 페이지 크기
     */
    @Builder.Default
    private Integer size = 10;

    /**
     * 정렬 기준 (meetingBodyId, gubun, meetingName, meetingPeriod, createdAt 등)
     */
    @Builder.Default
    private String sortBy = "createdAt";

    /**
     * 정렬 방향 (asc, desc)
     */
    @Builder.Default
    private String sortDirection = "desc";
}