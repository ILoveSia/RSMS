package org.itcen.domain.common.repository;

import org.itcen.domain.common.entity.CommonCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 공통코드 레포지토리 인터페이스
 * 
 * 공통코드 데이터 액세스를 담당하는 레포지토리입니다.
 * JpaRepository를 확장하여 기본 CRUD 기능을 제공하고,
 * 공통코드 특화된 쿼리 메서드를 추가로 정의합니다.
 * 
 * 설계 원칙:
 * - Interface Segregation: 공통코드 관련 데이터 액세스만 담당
 * - Dependency Inversion: 구체적인 구현이 아닌 인터페이스에 의존
 */
import org.itcen.domain.common.entity.CommonCodeId;

@Repository
public interface CommonCodeRepository extends JpaRepository<CommonCode, CommonCodeId> {

    /**
     * 그룹코드로 공통코드 목록 조회
     * 
     * @param groupCode 그룹코드
     * @return 해당 그룹의 공통코드 목록 (정렬순서 기준 정렬)
     */
    @Query("SELECT cc FROM CommonCode cc WHERE cc.groupCode = :groupCode ORDER BY cc.sortOrder ASC, cc.code ASC")
    List<CommonCode> findByGroupCodeOrderBySortOrderAscCodeAsc(@Param("groupCode") String groupCode);

    /**
     * 그룹코드와 사용여부로 공통코드 목록 조회
     * 
     * @param groupCode 그룹코드
     * @param useYn 사용여부
     * @return 조건에 맞는 공통코드 목록
     */
    @Query("SELECT cc FROM CommonCode cc WHERE cc.groupCode = :groupCode AND cc.useYn = :useYn ORDER BY cc.sortOrder ASC, cc.code ASC")
    List<CommonCode> findByGroupCodeAndUseYnOrderBySortOrderAscCodeAsc(
            @Param("groupCode") String groupCode, 
            @Param("useYn") String useYn);

    /**
     * 사용 가능한 공통코드만 그룹별로 조회
     * 
     * @param groupCode 그룹코드
     * @return 사용 가능한 공통코드 목록
     */
    default List<CommonCode> findUsableByGroupCode(String groupCode) {
        return findByGroupCodeAndUseYnOrderBySortOrderAscCodeAsc(groupCode, "Y");
    }

    /**
     * 특정 그룹코드와 코드로 공통코드 조회
     * 
     * @param groupCode 그룹코드
     * @param code 코드
     * @return 조건에 맞는 공통코드
     */
    Optional<CommonCode> findByGroupCodeAndCode(String groupCode, String code);

    /**
     * 코드명으로 공통코드 검색 (부분 일치)
     * 
     * @param codeName 코드명 (부분 검색)
     * @return 코드명이 포함된 공통코드 목록
     */
    @Query("SELECT cc FROM CommonCode cc WHERE cc.codeName LIKE %:codeName% ORDER BY cc.groupCode ASC, cc.sortOrder ASC")
    List<CommonCode> findByCodeNameContainingIgnoreCase(@Param("codeName") String codeName);

    /**
     * 사용 가능한 모든 공통코드 조회
     * 
     * @return 사용 가능한 모든 공통코드 목록
     */
    @Query("SELECT cc FROM CommonCode cc WHERE cc.useYn = 'Y' ORDER BY cc.groupCode ASC, cc.sortOrder ASC, cc.code ASC")
    List<CommonCode> findAllUsable();

    /**
     * 그룹코드 목록 조회 (중복 제거)
     * 
     * @return 시스템에 등록된 모든 그룹코드 목록
     */
    @Query("SELECT DISTINCT cc.groupCode FROM CommonCode cc ORDER BY cc.groupCode ASC")
    List<String> findDistinctGroupCodes();

    /**
     * 사용 가능한 그룹코드 목록 조회 (중복 제거)
     * 
     * @return 사용 가능한 그룹코드 목록
     */
    @Query("SELECT DISTINCT cc.groupCode FROM CommonCode cc WHERE cc.useYn = 'Y' ORDER BY cc.groupCode ASC")
    List<String> findDistinctUsableGroupCodes();

    /**
     * 그룹코드별 공통코드 개수 조회
     * 
     * @param groupCode 그룹코드
     * @return 해당 그룹의 공통코드 개수
     */
    @Query("SELECT COUNT(cc) FROM CommonCode cc WHERE cc.groupCode = :groupCode")
    long countByGroupCode(@Param("groupCode") String groupCode);

    /**
     * 그룹코드와 사용여부별 공통코드 개수 조회
     * 
     * @param groupCode 그룹코드
     * @param useYn 사용여부
     * @return 조건에 맞는 공통코드 개수
     */
    @Query("SELECT COUNT(cc) FROM CommonCode cc WHERE cc.groupCode = :groupCode AND cc.useYn = :useYn")
    long countByGroupCodeAndUseYn(@Param("groupCode") String groupCode, @Param("useYn") String useYn);

    /**
     * 복합 조건으로 공통코드 검색
     * 
     * @param groupCode 그룹코드 (null 가능)
     * @param code 코드 (null 가능)
     * @param codeName 코드명 (부분 검색, null 가능)
     * @param useYn 사용여부 (null 가능)
     * @return 조건에 맞는 공통코드 목록
     */
    @Query("SELECT cc FROM CommonCode cc WHERE " +
           "(:groupCode IS NULL OR cc.groupCode = :groupCode) AND " +
           "(:code IS NULL OR cc.code = :code) AND " +
           "(:codeName IS NULL OR cc.codeName LIKE %:codeName%) AND " +
           "(:useYn IS NULL OR cc.useYn = :useYn) " +
           "ORDER BY cc.groupCode ASC, cc.sortOrder ASC, cc.code ASC")
    List<CommonCode> findBySearchConditions(
            @Param("groupCode") String groupCode,
            @Param("code") String code,
            @Param("codeName") String codeName,
            @Param("useYn") String useYn);

    /**
     * 공통코드 존재 여부 확인
     * 
     * @param groupCode 그룹코드
     * @param code 코드
     * @return 존재 여부
     */
    boolean existsByGroupCodeAndCode(String groupCode, String code);

    /**
     * 특정 그룹에서 최대 정렬순서 조회
     * 
     * @param groupCode 그룹코드
     * @return 최대 정렬순서 (없으면 0)
     */
    @Query("SELECT COALESCE(MAX(cc.sortOrder), 0) FROM CommonCode cc WHERE cc.groupCode = :groupCode")
    Integer findMaxSortOrderByGroupCode(@Param("groupCode") String groupCode);
} 