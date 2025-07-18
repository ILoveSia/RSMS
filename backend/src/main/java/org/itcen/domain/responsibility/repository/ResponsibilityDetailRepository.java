package org.itcen.domain.responsibility.repository;

import org.itcen.domain.responsibility.dto.ResponsibilityStatusDto;
import org.itcen.domain.responsibility.entity.ResponsibilityDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ResponsibilityDetailRepository extends JpaRepository<ResponsibilityDetail, Long> {

    @Query("SELECT new org.itcen.domain.responsibility.dto.ResponsibilityStatusDto(" +
            "d.responsibility.id, " +
            "d.responsibility.responsibilityContent, " +
            "d.id, " +
            "d.responsibilityDetailContent, " +
            "d.responsibilityMgtSts, " +
            "d.responsibilityRelEvid, " +
            "d.createdAt, " +
            "d.updatedAt) " +
            "FROM ResponsibilityDetail d JOIN d.responsibility r " +
            "ORDER BY r.id, d.id")
    List<ResponsibilityStatusDto> findResponsibilityStatusList();

    @Query("SELECT new org.itcen.domain.responsibility.dto.ResponsibilityStatusDto(" +
            "d.responsibility.id, " +
            "d.responsibility.responsibilityContent, " +
            "d.id, " +
            "d.responsibilityDetailContent, " +
            "d.responsibilityMgtSts, " +
            "d.responsibilityRelEvid, " +
            "d.createdAt, " +
            "d.updatedAt) " +
            "FROM ResponsibilityDetail d JOIN d.responsibility r WHERE r.id = :responsibilityId " +
            "ORDER BY r.id, d.id")
    List<ResponsibilityStatusDto> findResponsibilityStatusListById(Long responsibilityId);

    List<ResponsibilityDetail> findAllByResponsibilityId(Long responsibilityId);
} 