package org.itcen.domain.positions.repository;

import java.util.List;
import org.itcen.domain.positions.dto.PositionStatusProjection;
import org.itcen.domain.positions.entity.Position;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * 직책 Repository
 *
 * 직책 엔티티에 대한 데이터 액세스를 담당합니다.
 *
 * SOLID 원칙: - Single Responsibility: 직책 데이터 액세스만 담당 - Open/Closed: 새로운 쿼리 메서드 추가 시 확장 가능 -
 * Interface Segregation: 필요한 메서드만 정의 - Dependency Inversion: 구현체에 의존하지 않고 인터페이스에 의존
 */
@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {

    /**
     * 원장차수+진행상태 목록 조회 (중복 제거)
     */
    @Query("SELECT DISTINCT p.ledgerOrder AS ledgerOrder, p.orderStatus AS orderStatus FROM Position p WHERE p.ledgerOrder IS NOT NULL ORDER BY p.ledgerOrder DESC")
    List<Object[]> findDistinctLedgerOrdersWithStatus();

    /**
     * 원장차수로 직책 목록 조회
     */
    List<Position> findByLedgerOrder(String ledgerOrder);

    /**
     * 직책명으로 직책 목록 조회 (부분 검색)
     */
    List<Position> findByPositionsNmContaining(String positionsNm);

    /**
     * 확정구분코드로 직책 목록 조회
     */
    List<Position> findByConfirmGubunCd(String confirmGubunCd);

    /**
     * 책무기술서 작성 부서코드로 직책 목록 조회
     */
    List<Position> findByWriteDeptCd(String writeDeptCd);

    /**
     * 복합 조건 검색 (동적 쿼리)
     */
    @Query("SELECT p FROM Position p WHERE "
            + "(:positionsId IS NULL OR p.positionsId = :positionsId) AND "
            + "(:ledgerOrder IS NULL OR p.ledgerOrder = :ledgerOrder) AND "
            + "(:positionsNm IS NULL OR p.positionsNm LIKE %:positionsNm%) AND "
            + "(:confirmGubunCd IS NULL OR p.confirmGubunCd = :confirmGubunCd) AND "
            + "(:writeDeptCd IS NULL OR p.writeDeptCd = :writeDeptCd)")
    Page<Position> findBySearchConditions(@Param("positionsId") Long positionsId,
            @Param("ledgerOrder") String ledgerOrder, @Param("positionsNm") String positionsNm,
            @Param("confirmGubunCd") String confirmGubunCd,
            @Param("writeDeptCd") String writeDeptCd, Pageable pageable);

    /**
     * 원장차수별 직책 개수 조회
     */
    Long countByLedgerOrder(String ledgerOrder);

    /**
     * 확정구분코드별 직책 개수 조회
     */
    Long countByConfirmGubunCd(String confirmGubunCd);

    /**
     * 직책명 중복 체크
     */
    boolean existsByPositionsNm(String positionsNm);

    /**
     * 직책명 중복 체크 (수정 시)
     */
    boolean existsByPositionsNmAndPositionsIdNot(String positionsNm, Long positionsId);

    /**
     * 직책 현황 목록 조회 (Native Query) - departments 테이블 사용
     */
    @Query(value = """
                SELECT
                    p.positions_id AS positionsId,
                    p.positions_nm AS positionsNm,
                    COALESCE(d_write.department_name, p.write_dept_cd) AS writeDeptNm,
                    (
                        SELECT STRING_AGG(COALESCE(d_owner.department_name, pod.owner_dept_cd), ', ')
                        FROM positions_owner_dept pod
                        LEFT JOIN departments d_owner ON pod.owner_dept_cd = d_owner.department_id AND d_owner.use_yn = 'Y'
                        WHERE pod.positions_id = p.positions_id
                    ) AS ownerDeptNms,
                    (
                        SELECT COUNT(*)
                        FROM positions_admin pa
                        WHERE pa.positions_id = p.positions_id
                    ) AS adminCount
                FROM
                    positions p
                LEFT JOIN
                    departments d_write ON p.write_dept_cd = d_write.department_id AND d_write.use_yn = 'Y'
                ORDER BY
                    p.created_at DESC
            """,
            nativeQuery = true)
    List<PositionStatusProjection> findPositionStatusList();
}
