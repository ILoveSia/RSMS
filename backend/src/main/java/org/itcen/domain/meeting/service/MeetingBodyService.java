package org.itcen.domain.meeting.service;

import org.itcen.domain.meeting.dto.*;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 회의체 Service 인터페이스
 * 
 * 회의체 비즈니스 로직을 정의하는 인터페이스입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 회의체 비즈니스 로직만 담당
 * - Open/Closed: 새로운 기능 추가 시 확장 가능
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 구현체에 의존하지 않고 인터페이스에 의존
 */
public interface MeetingBodyService {
    /**
     * 전체 회의체 목록 조회
     * 
     * @return 회의체 목록
     */
    List<MeetingBodyDto> getAllMeetingBodies();
    /**
     * 회의체 생성
     * 
     * @param createRequestDto 생성 요청 DTO
     * @return 생성된 회의체 DTO
     */
    MeetingBodyDto createMeetingBody(MeetingBodyCreateRequestDto createRequestDto);

    /**
     * 회의체 수정
     * 
     * @param meetingBodyId 회의체 ID
     * @param updateRequestDto 수정 요청 DTO
     * @return 수정된 회의체 DTO
     */
    MeetingBodyDto updateMeetingBody(String meetingBodyId, MeetingBodyUpdateRequestDto updateRequestDto);

    /**
     * 회의체 삭제
     * 
     * @param meetingBodyId 회의체 ID
     */
    void deleteMeetingBody(String meetingBodyId);

    /**
     * 회의체 단건 조회
     * 
     * @param meetingBodyId 회의체 ID
     * @return 회의체 DTO
     */
    MeetingBodyDto getMeetingBody(String meetingBodyId);

    /**
     * 구분별 회의체 목록 조회
     * 
     * @param gubun 구분
     * @return 회의체 목록
     */
    List<MeetingBodyDto> getMeetingBodiesByGubun(String gubun);

    /**
     * 회의체 검색 (페이징)
     * 
     * @param searchRequestDto 검색 조건 DTO
     * @return 페이징된 회의체 목록
     */
    Page<MeetingBodyDto> searchMeetingBodies(MeetingBodySearchRequestDto searchRequestDto);
    /**
     * 회의체명 중복 체크
     * 
     * @param meetingName 회의체명
     * @return 중복 여부
     */
    boolean isDuplicateMeetingName(String meetingName);

    /**
     * 회의체명 중복 체크 (수정 시)
     * 
     * @param meetingName 회의체명
     * @param meetingBodyId 자신의 ID
     * @return 중복 여부
     */
    boolean isDuplicateMeetingName(String meetingName, String meetingBodyId);

    /**
     * 여러 회의체 일괄 삭제
     *
     * @param ids 삭제할 회의체 ID 리스트
     *
     * 구조적 설명:
     * - 단일 책임 원칙: 서비스는 비즈니스 로직만 담당
     * - 확장/폐쇄 원칙: 단건/다건 삭제 모두 지원하도록 확장
     */
    void deleteMeetingBodies(List<String> ids);
}