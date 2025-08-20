package org.itcen.domain.qna.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.itcen.domain.qna.entity.Qna;
import org.itcen.domain.qna.entity.QnaPriority;
import org.itcen.domain.qna.entity.QnaStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Q&A Repository 인터페이스
 *
 * Q&A 엔티티에 대한 데이터 접근을 담당합니다.
 *
 * SOLID 원칙: - Single Responsibility: Q&A 데이터 접근만 담당 - Interface Segregation: 필요한 메서드만 정의 -
 * Dependency Inversion: 구현체가 아닌 인터페이스에 의존
 */
@Repository
public interface QnaRepository extends JpaRepository<Qna, Long> {

    /**
     * 상태별 Q&A 목록 조회
     *
     * @param status 상태
     * @param pageable 페이징 정보
     * @return Q&A 페이지
     */
    Page<Qna> findByStatus(QnaStatus status, Pageable pageable);

    // NOTE: DB 스키마에서 department 컬럼이 제거되어 더 이상 사용하지 않습니다.
    // Page<Qna> findByDepartment(String department, Pageable pageable);

    /**
     * 질문자별 Q&A 목록 조회
     *
     * @param questionerId 질문자 ID
     * @param pageable 페이징 정보
     * @return Q&A 페이지
     */
    Page<Qna> findByQuestionerId(String questionerId, Pageable pageable);

    /**
     * 답변자별 Q&A 목록 조회
     *
     * @param answererId 답변자 ID
     * @param pageable 페이징 정보
     * @return Q&A 페이지
     */
    Page<Qna> findByAnswererId(String answererId, Pageable pageable);

    /**
     * 키워드로 Q&A 검색 (제목, 내용에서 검색)
     *
     * @param keyword 검색 키워드
     * @param pageable 페이징 정보
     * @return Q&A 페이지
     */
    @Query("SELECT q FROM Qna q WHERE q.title LIKE %:keyword% OR q.content LIKE %:keyword%")
    Page<Qna> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 복합 조건으로 Q&A 검색
     *
     * @param keyword 검색 키워드
     * @param department 부서
     * @param status 상태
     * @param priority 우선순위
     * @param category 카테고리
     * @param isPublic 공개여부
     * @param startDate 시작일
     * @param endDate 종료일
     * @param pageable 페이징 정보
     * @return Q&A 페이지
     */
    @Query("SELECT q FROM Qna q WHERE "
            + "(:keyword IS NULL OR q.title LIKE CONCAT('%', :keyword, '%') OR q.content LIKE CONCAT('%', :keyword, '%')) AND "
            + "(:department IS NULL OR 1=1) AND "
            + "(:status IS NULL OR q.status = :status) AND "
            + "(:priority IS NULL OR 1=1) AND "
            + "(:category IS NULL OR q.category = :category) AND "
            + "(:isPublic IS NULL OR q.isPublic = :isPublic) AND "
            + "q.createdAt >= COALESCE(:startDate, q.createdAt) AND "
            + "q.createdAt <= COALESCE(:endDate, q.createdAt)")
    Page<Qna> findBySearchConditions(@Param("keyword") String keyword,
            @Param("department") String department, @Param("status") QnaStatus status,
            @Param("priority") QnaPriority priority, @Param("category") String category,
            @Param("isPublic") Boolean isPublic, @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate, Pageable pageable);

    /**
     * 공개 Q&A 목록 조회
     *
     * @param pageable 페이징 정보
     * @return Q&A 페이지
     */
    Page<Qna> findByIsPublicTrue(Pageable pageable);

    /**
     * 우선순위별 Q&A 목록 조회
     *
     * @param priority 우선순위
     * @param pageable 페이징 정보
     * @return Q&A 페이지
     */
    Page<Qna> findByPriority(QnaPriority priority, Pageable pageable);

    /**
     * 카테고리별 Q&A 목록 조회
     *
     * @param category 카테고리
     * @param pageable 페이징 정보
     * @return Q&A 페이지
     */
    Page<Qna> findByCategory(String category, Pageable pageable);

    /**
     * 상태별 Q&A 개수 조회
     *
     * @param status 상태
     * @return Q&A 개수
     */
    Long countByStatus(QnaStatus status);

    // NOTE: DB 스키마에서 department 컬럼이 제거되어 더 이상 사용하지 않습니다.
    // Long countByDepartment(String department);

    /**
     * 조회수 증가
     *
     * @param id Q&A ID
     */
    @Modifying
    @Query("UPDATE Qna q SET q.viewCount = q.viewCount + 1 WHERE q.id = :id")
    void incrementViewCount(@Param("id") Long id);

    /**
     * ID와 질문자로 Q&A 조회 (권한 확인용)
     *
     * @param id Q&A ID
     * @param questionerId 질문자 ID
     * @return Q&A
     */
    Optional<Qna> findByIdAndQuestionerId(Long id, String questionerId);

    /**
     * ID와 답변자로 Q&A 조회 (권한 확인용)
     *
     * @param id Q&A ID
     * @param answererId 답변자 ID
     * @return Q&A
     */
    Optional<Qna> findByIdAndAnswererId(Long id, String answererId);

    /**
     * 특정 기간 내 생성된 Q&A 목록 조회
     *
     * @param startDate 시작일
     * @param endDate 종료일
     * @param pageable 페이징 정보
     * @return Q&A 페이지
     */
    @Query("SELECT q FROM Qna q WHERE q.createdAt BETWEEN :startDate AND :endDate")
    Page<Qna> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate, Pageable pageable);

    /**
     * 답변 완료된 Q&A 중 특정 기간 내 답변된 목록 조회
     *
     * @param startDate 시작일
     * @param endDate 종료일
     * @param pageable 페이징 정보
     * @return Q&A 페이지
     */
    @Query("SELECT q FROM Qna q WHERE q.answeredAt BETWEEN :startDate AND :endDate")
    Page<Qna> findByAnsweredAtBetween(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate, Pageable pageable);

    /**
     * 특정 사용자가 작성한 Q&A 중 답변 대기 중인 목록 조회
     *
     * @param questionerId 질문자 ID
     * @return Q&A 목록
     */
    List<Qna> findByQuestionerIdAndStatus(String questionerId, QnaStatus status);


    /**
     * 월별 Q&A 통계 조회
     *
     * @param startDate 시작일
     * @return 월별 통계 목록
     */
    @Query(value = "SELECT " + "TO_CHAR(q.created_at, 'YYYY-MM') as month, 'ALL' as department, "
            + "COUNT(q.*) as question_count, "
            + "COUNT(CASE WHEN q.status = 'ANSWERED' THEN 1 END) as answer_count, "
            + "COUNT(CASE WHEN q.status = 'PENDING' THEN 1 END) as pending_count "
            + "FROM qna q WHERE q.created_at >= :startDate "
            + "GROUP BY TO_CHAR(q.created_at, 'YYYY-MM') "
            + "ORDER BY TO_CHAR(q.created_at, 'YYYY-MM') DESC", nativeQuery = true)
    List<Object[]> findMonthlyStatisticsRaw(@Param("startDate") LocalDateTime startDate);
}
