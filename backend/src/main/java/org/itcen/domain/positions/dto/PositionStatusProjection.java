package org.itcen.domain.positions.dto;

/**
 * 직책 현황 목록 조회를 위한 JPA 프로젝션 인터페이스
 */
public interface PositionStatusProjection {
    Long getPositionsId();
    String getPositionsNm();
    String getWriteDeptNm();
    String getOwnerDeptNms();
    Long getAdminCount();
} 