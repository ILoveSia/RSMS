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
            "COALESCE(lo.ledgerOrdersStatusCd, 'NONE'), " +
            "d.createdAt, " +
            "d.updatedAt) " +
            "FROM ResponsibilityDetail d " +
            "JOIN d.responsibility r " +
            "LEFT JOIN org.itcen.domain.positions.entity.LedgerOrders lo ON r.ledgerOrder = lo.ledgerOrdersId " +
            "ORDER BY r.id, d.id")
    List<ResponsibilityStatusDto> findResponsibilityStatusList();

    @Query("SELECT new org.itcen.domain.responsibility.dto.ResponsibilityStatusDto(" +
            "d.responsibility.id, " +
            "d.responsibility.responsibilityContent, " +
            "d.id, " +
            "d.responsibilityDetailContent, " +
            "d.responsibilityMgtSts, " +
            "d.responsibilityRelEvid, " +
            "COALESCE(lo.ledgerOrdersStatusCd, 'NONE'), " +
            "d.createdAt, " +
            "d.updatedAt) " +
            "FROM ResponsibilityDetail d " +
            "JOIN d.responsibility r " +
            "LEFT JOIN org.itcen.domain.positions.entity.LedgerOrders lo ON r.ledgerOrder = lo.ledgerOrdersId " +
            "WHERE r.id = :responsibilityId " +
            "ORDER BY r.id, d.id")
    List<ResponsibilityStatusDto> findResponsibilityStatusListById(Long responsibilityId);

    @Query("SELECT new org.itcen.domain.responsibility.dto.ResponsibilityStatusDto(" +
            "d.responsibility.id, " +
            "d.responsibility.responsibilityContent, " +
            "d.id, " +
            "d.responsibilityDetailContent, " +
            "d.responsibilityMgtSts, " +
            "d.responsibilityRelEvid, " +
            "COALESCE(lo.ledgerOrdersStatusCd, 'NONE'), " +
            "d.createdAt, " +
            "d.updatedAt) " +
            "FROM ResponsibilityDetail d " +
            "JOIN d.responsibility r " +
            "LEFT JOIN org.itcen.domain.positions.entity.LedgerOrders lo ON r.ledgerOrder = lo.ledgerOrdersId " +
            "WHERE r.ledgerOrder = :ledgerOrdersId " +
            "ORDER BY r.id, d.id")
    List<ResponsibilityStatusDto> findResponsibilityStatusListByLedgerOrdersId(Long ledgerOrdersId);

    List<ResponsibilityDetail> findAllByResponsibilityId(Long responsibilityId);
} 