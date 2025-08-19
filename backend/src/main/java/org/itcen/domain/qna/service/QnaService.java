package org.itcen.domain.qna.service;

import org.itcen.domain.qna.dto.*;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Q&A 서비스 인터페이스
 * 
 * Q&A 관련 비즈니스 로직을 정의하는 인터페이스입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: Q&A 비즈니스 로직만 담당
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 구현체가 아닌 인터페이스에 의존
 */
public interface QnaService {

    /**
     * Q&A 목록 조회 (검색 조건 포함)
     * 
     * @param searchRequest 검색 조건
     * @return Q&A 목록 페이지
     */
    Page<QnaListResponseDto> getQnaList(QnaSearchRequestDto searchRequest);

    /**
     * Q&A 상세 조회
     * 
     * @param id Q&A ID
     * @param currentUserId 현재 사용자 ID (조회수 증가 및 권한 확인용)
     * @return Q&A 상세 정보
     */
    QnaDetailResponseDto getQnaDetail(Long id, String currentUserId);

    /**
     * Q&A 생성
     * 
     * @param createRequest 생성 요청 데이터
     * @param currentUserId 현재 사용자 ID
     * @param currentUserName 현재 사용자 이름
     * @return 생성된 Q&A ID
     */
    Long createQna(QnaCreateRequestDto createRequest, String currentUserId, String currentUserName);

    /**
     * Q&A 수정
     * 
     * @param id Q&A ID
     * @param updateRequest 수정 요청 데이터
     * @param currentUserId 현재 사용자 ID
     */
    void updateQna(Long id, QnaUpdateRequestDto updateRequest, String currentUserId);

    /**
     * Q&A 삭제
     * 
     * @param id Q&A ID
     * @param currentUserId 현재 사용자 ID
     */
    void deleteQna(Long id, String currentUserId);

    /**
     * Q&A 답변 등록
     * 
     * @param id Q&A ID
     * @param answerRequest 답변 요청 데이터
     * @param currentUserId 현재 사용자 ID (답변자)
     * @param currentUserName 현재 사용자 이름
     */
    void addAnswer(Long id, QnaAnswerRequestDto answerRequest, String currentUserId, String currentUserName);

    /**
     * Q&A 답변 수정
     * 
     * @param id Q&A ID
     * @param answerRequest 답변 수정 요청 데이터
     * @param currentUserId 현재 사용자 ID
     */
    void updateAnswer(Long id, QnaAnswerRequestDto answerRequest, String currentUserId);

    /**
     * 내가 작성한 Q&A 목록 조회
     * 
     * @param currentUserId 현재 사용자 ID
     * @param searchRequest 검색 조건
     * @return Q&A 목록 페이지
     */
    Page<QnaListResponseDto> getMyQnaList(String currentUserId, QnaSearchRequestDto searchRequest);

    /**
     * 내가 답변한 Q&A 목록 조회
     * 
     * @param currentUserId 현재 사용자 ID
     * @param searchRequest 검색 조건
     * @return Q&A 목록 페이지
     */
    Page<QnaListResponseDto> getMyAnsweredQnaList(String currentUserId, QnaSearchRequestDto searchRequest);

    /**
     * 미답변 Q&A 개수 조회
     * 
     * @return 미답변 Q&A 개수
     */
    Long getPendingQnaCount();


    /**
     * Q&A 존재 여부 확인
     * 
     * @param id Q&A ID
     * @return 존재 여부
     */
    boolean existsQna(Long id);

    /**
     * Q&A 수정 권한 확인
     * 
     * @param id Q&A ID
     * @param currentUserId 현재 사용자 ID
     * @return 수정 권한 여부
     */
    boolean canEditQna(Long id, String currentUserId);

    /**
     * Q&A 답변 권한 확인
     * 
     * @param id Q&A ID
     * @param currentUserId 현재 사용자 ID
     * @return 답변 권한 여부
     */
    boolean canAnswerQna(Long id, String currentUserId);

}