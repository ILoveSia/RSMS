package org.itcen.domain.main.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.main.dto.*;
import org.itcen.domain.positions.repository.LedgerOrdersRepository;
import org.itcen.domain.positions.entity.LedgerOrders;
import org.itcen.domain.positions.entity.LedgerOrdersHod;
import org.itcen.domain.approval.repository.ApprovalStepRepository;
import org.itcen.domain.approval.repository.ApprovalRepository;
import org.itcen.domain.approval.entity.Approval;
import org.itcen.domain.approval.entity.ApprovalStep;
import org.itcen.domain.common.repository.CommonCodeRepository;
import org.itcen.domain.audit.repository.AuditProgMngtDetailRepository;
import org.itcen.domain.qna.repository.QnaRepository;
import org.itcen.domain.qna.entity.Qna;
import org.itcen.domain.notice.repository.NoticeRepository;
import org.itcen.domain.notice.entity.Notice;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

/**
 * 새로운 메인 대시보드 서비스 구현체
 * 워크플로우, 통계, QnA, 공지사항, 결재 관련 비즈니스 로직을 처리합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NewMainDashboardServiceImpl implements NewMainDashboardService {

    private final LedgerOrdersRepository ledgerOrdersRepository;
    private final ApprovalStepRepository approvalStepRepository;
    private final ApprovalRepository approvalRepository;
    private final CommonCodeRepository commonCodeRepository;
    private final AuditProgMngtDetailRepository auditProgMngtDetailRepository;
    private final QnaRepository qnaRepository;
    private final NoticeRepository noticeRepository;

    /**
     * 최신 원장 상태 조회 (MAX ledger_orders_id)
     */
    @Override
    public LedgerOrdersStatusDto getLedgerOrdersStatus() {
        log.debug("최신 원장 상태 조회 시작");
        
        try {
            LedgerOrders latestOrder = ledgerOrdersRepository.findLatestLedgerOrder()
                .orElse(null);
            
            if (latestOrder == null) {
                log.info("원장 상태 데이터가 없습니다");
                return LedgerOrdersStatusDto.builder()
                    .ledgerOrdersId(0L)
                    .ledgerOrdersTitle("데이터 없음")
                    .ledgerOrdersStatusCd("N/A")
                    .ledgerOrdersStatusName("데이터 없음")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            }
            
            // 상태코드명 조회
            String statusName = getStatusName(latestOrder.getLedgerOrdersStatusCd(), "ORDER_STATUS");
            
            log.debug("최신 원장 상태 조회 완료: ID={}, Title={}, Status={}", 
                latestOrder.getLedgerOrdersId(), 
                latestOrder.getLedgerOrdersTitle(), 
                latestOrder.getLedgerOrdersStatusCd());
            
            return LedgerOrdersStatusDto.builder()
                .ledgerOrdersId(latestOrder.getLedgerOrdersId())
                .ledgerOrdersTitle(latestOrder.getLedgerOrdersTitle())
                .ledgerOrdersStatusCd(latestOrder.getLedgerOrdersStatusCd())
                .ledgerOrdersStatusName(statusName)
                .createdAt(latestOrder.getCreatedAt())
                .updatedAt(latestOrder.getUpdatedAt())
                .build();
                
        } catch (Exception e) {
            log.error("최신 원장 상태 조회 중 오류 발생", e);
            return LedgerOrdersStatusDto.builder()
                .ledgerOrdersId(0L)
                .ledgerOrdersTitle("조회 오류")
                .ledgerOrdersStatusCd("ERROR")
                .ledgerOrdersStatusName("조회 오류")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        }
    }
    
    /**
     * 최신 부서장 내부통제 상태 조회 (MAX ledger_orders_hod_id)
     */
    @Override
    public LedgerOrdersHodStatusDto getLedgerOrdersHodStatus() {
        log.debug("최신 부서장 내부통제 상태 조회 시작");
        
        try {
            // 임시로 기본값 반환 (실제 repository 추가 필요)
            String statusCd = "P5";
            String statusName = getStatusName(statusCd, "ORDER_HOD_STATUS");
            
            return LedgerOrdersHodStatusDto.builder()
                .ledgerOrdersId(1L)
                .ledgerOrdersHodId(1L)
                .ledgerOrdersHodTitle("2025년 1차 부서장 내부통제")
                .ledgerOrdersHodStatusCd(statusCd)
                .ledgerOrdersHodStatusName(statusName)
                .createdAt(LocalDateTime.now().minusDays(5))
                .updatedAt(LocalDateTime.now().minusDays(1))
                .build();
                
        } catch (Exception e) {
            log.error("최신 부서장 내부통제 상태 조회 중 오류 발생", e);
            return LedgerOrdersHodStatusDto.builder()
                .ledgerOrdersId(0L)
                .ledgerOrdersHodId(0L)
                .ledgerOrdersHodTitle("조회 오류")
                .ledgerOrdersHodStatusCd("ERROR")
                .ledgerOrdersHodStatusName("조회 오류")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        }
    }
    
    /**
     * 전체 점검 통계 조회 (실제 데이터베이스에서 조회)
     */
    @Override
    public AuditStatisticsDto getAuditStatistics() {
        log.debug("전체 점검 통계 조회 시작");
        
        try {
            // 전체 점검 항목 수 조회
            Long totalCountLong = auditProgMngtDetailRepository.count();
            int totalCount = totalCountLong != null ? totalCountLong.intValue() : 0;
            
            // 적정(INS02) 건수 조회
            List<org.itcen.domain.audit.entity.AuditProgMngtDetail> appropriateList = 
                auditProgMngtDetailRepository.findByAuditResultStatusCd("INS02");
            int appropriateCount = appropriateList != null ? appropriateList.size() : 0;
            
            // 미흡(INS03) 건수 조회
            List<org.itcen.domain.audit.entity.AuditProgMngtDetail> inadequateList = 
                auditProgMngtDetailRepository.findByAuditResultStatusCd("INS03");
            int inadequateCount = inadequateList != null ? inadequateList.size() : 0;
            
            // 점검제외(INS04) 건수 조회
            List<org.itcen.domain.audit.entity.AuditProgMngtDetail> excludedList = 
                auditProgMngtDetailRepository.findByAuditResultStatusCd("INS04");
            int excludedCount = excludedList != null ? excludedList.size() : 0;
            
            // 적정 수행율: 적정 / 전체
            double appropriateRate = totalCount > 0 ? (double) appropriateCount / totalCount * 100 : 0.0;
            
            // 이행 완료율: 결재완료(PLI03) / 미흡사항
            // 미흡사항 중에서 개선계획 결재완료된 비율
            long completedCount = inadequateList != null ? inadequateList.stream()
                .filter(detail -> "PLI03".equals(detail.getImpPlStatusCd()))
                .count() : 0;
            
            double completionRate = inadequateCount > 0 ? (double) completedCount / inadequateCount * 100 : 0.0;
            
            log.debug("점검 통계 조회 완료: 전체={}, 적정={}, 미흡={}, 제외={}, 이행완료율={}%", 
                totalCount, appropriateCount, inadequateCount, excludedCount, completionRate);
            
            return AuditStatisticsDto.builder()
                .totalCount(totalCount)
                .appropriateCount(appropriateCount)
                .inadequateCount(inadequateCount)
                .excludedCount(excludedCount)
                .appropriateRate(Math.round(appropriateRate * 100) / 100.0) // 소수점 2자리
                .completionRate(Math.round(completionRate * 100) / 100.0) // 소수점 2자리
                .lastUpdated(LocalDateTime.now())
                .build();
                
        } catch (Exception e) {
            log.error("전체 점검 통계 조회 중 오류 발생", e);
            return AuditStatisticsDto.builder()
                .totalCount(0)
                .appropriateCount(0)
                .inadequateCount(0)
                .excludedCount(0)
                .appropriateRate(0.0)
                .completionRate(0.0)
                .lastUpdated(LocalDateTime.now())
                .build();
        }
    }
    
    /**
     * 최근 QnA 3건 조회 (실제 데이터베이스에서 조회)
     */
    @Override
    public List<RecentQnaDto> getRecentQna() {
        log.debug("최근 QnA 3건 조회 시작");
        
        try {
            // 최신 생성일 기준으로 3건 조회
            PageRequest pageRequest = PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "createdAt"));
            List<Qna> qnaList = qnaRepository.findAll(pageRequest).getContent();
            
            if (qnaList.isEmpty()) {
                log.info("QnA 데이터가 없습니다");
                return Collections.emptyList();
            }
            
            List<RecentQnaDto> result = new ArrayList<>();
            
            for (Qna qna : qnaList) {
                String categoryName = getCategoryName(qna.getCategory());
                String statusName = getQnaStatusName(qna.getStatus().name());
                String statusString = qna.getStatus().name();
                
                result.add(RecentQnaDto.builder()
                    .id(qna.getId())
                    .title(qna.getTitle())
                    .category(categoryName)
                    .status(statusString)
                    .questionerEmpNo(qna.getQuestionerId())
                    .createdAt(qna.getCreatedAt())
                    .viewCount(qna.getViewCount())
                    .isAnswered("ANSWERED".equals(statusString))
                    .build());
            }
            
            log.debug("최근 QnA 조회 완료: {}건", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("최근 QnA 조회 중 오류 발생", e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 최근 공지사항 3건 조회 (실제 데이터베이스에서 조회)
     */
    @Override
    public List<RecentNoticeDto> getRecentNotice() {
        log.debug("최근 공지사항 3건 조회 시작");
        
        try {
            // 고정글 우선, 최신 생성일 기준으로 3건 조회
            PageRequest pageRequest = PageRequest.of(0, 3, Sort.by(
                Sort.Order.desc("pinned"), 
                Sort.Order.desc("createdAt")
            ));
            List<Notice> noticeList = noticeRepository.findAll(pageRequest).getContent();
            
            if (noticeList.isEmpty()) {
                log.info("공지사항 데이터가 없습니다");
                return Collections.emptyList();
            }
            
            List<RecentNoticeDto> result = new ArrayList<>();
            
            for (Notice notice : noticeList) {
                String categoryName = getCategoryName(notice.getCategory());
                
                result.add(RecentNoticeDto.builder()
                    .id(notice.getId())
                    .title(notice.getTitle())
                    .category(categoryName)
                    .createdAt(notice.getCreatedAt())
                    .viewCount(notice.getViewCount())
                    .pinned(notice.getPinned())
                    .build());
            }
            
            log.debug("최근 공지사항 조회 완료: {}건", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("최근 공지사항 조회 중 오류 발생", e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 내 결재 신청 목록 조회 (실제 데이터베이스에서 조회)
     */
    @Override
    public List<MyApprovalRequestDto> getMyApprovalRequests(String empNo) {
        log.debug("내 결재 신청 목록 조회 시작: empNo={}", empNo);
        
        try {
            // 신청자 기준으로 최신 순 3건 조회
            PageRequest pageRequest = PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "requestDatetime"));
            List<Approval> approvalList = approvalRepository.findByRequesterIdOrderByRequestDatetimeDesc(empNo, pageRequest);
            
            if (approvalList.isEmpty()) {
                log.info("내 결재 신청 데이터가 없습니다: empNo={}", empNo);
                return Collections.emptyList();
            }
            
            List<MyApprovalRequestDto> result = new ArrayList<>();
            
            for (Approval approval : approvalList) {
                String taskTypeInfo = getTaskTypeInfo(approval.getTaskTypeCd());
                String statName = getStatusName(approval.getApprStatCd(), "APPR_STAT_CD");
                String approverName = getUserName(approval.getApproverId());
                
                result.add(MyApprovalRequestDto.builder()
                    .approvalId(approval.getApprovalId())
                    .taskTypeCd(approval.getTaskTypeCd())
                    .taskTypeInfo(taskTypeInfo)
                    .taskId(approval.getTaskId())
                    .apprStatCd(approval.getApprStatCd())
                    .apprStatName(statName)
                    .requestDatetime(approval.getRequestDatetime())
                    .approverId(approval.getApproverId())
                    .approverName(approverName)
                    .comments(approval.getComments())
                    .build());
            }
            
            log.debug("내 결재 신청 목록 조회 완료: empNo={}, 건수={}", empNo, result.size());
            return result;
            
        } catch (Exception e) {
            log.error("내 결재 신청 목록 조회 중 오류 발생: empNo={}", empNo, e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 처리 대기 결재 목록 조회
     */
    @Override
    public List<PendingApprovalDto> getPendingApprovals(String empNo) {
        log.debug("처리 대기 결재 목록 조회 시작: empNo={}", empNo);
        
        try {
            // ApprovalStep repository를 사용하여 실제 데이터 조회
            List<ApprovalStep> pendingSteps = approvalStepRepository.findPendingStepsByApprover(empNo);
            
            if (pendingSteps.isEmpty()) {
                log.info("처리 대기 결재가 없습니다: empNo={}", empNo);
                return Collections.emptyList();
            }
            
            List<PendingApprovalDto> pendingList = new ArrayList<>();
            
            for (ApprovalStep step : pendingSteps) {
                Approval approval = step.getApproval();
                
                String taskTypeInfo = getTaskTypeInfo(approval.getTaskTypeCd());
                
                pendingList.add(PendingApprovalDto.builder()
                    .approvalId(approval.getApprovalId())
                    .taskTypeCd(approval.getTaskTypeCd())
                    .taskTypeInfo(taskTypeInfo)
                    .taskId(approval.getTaskId())
                    .requesterId(approval.getRequesterId())
                    .requesterName(getUserName(approval.getRequesterId()))
                    .requestDatetime(approval.getRequestDatetime())
                    .comments(approval.getComments())
                    .urgency(approval.getUrgencyCd())
                    .build());
            }
            
            log.debug("처리 대기 결재 목록 조회 완료: empNo={}, 건수={}", empNo, pendingList.size());
            return pendingList;
            
        } catch (Exception e) {
            log.error("처리 대기 결재 목록 조회 중 오류 발생: empNo={}", empNo, e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 내 결재 신청 목록 조회 (로그인 아이디 기준)
     * 쿼리: SELECT * FROM approval WHERE requester_id = 'testuser' AND appr_stat_cd = 'IN_PROGRESS'
     */
    @Override
    public List<MyApprovalRequestDto> getMyApprovalRequestsByUserid(String userid) {
        log.debug("내 결재 신청 목록 조회 시작 (로그인 아이디 기준): userid={}", userid);
        
        try {
            // requester_id 기준으로 IN_PROGRESS 상태 결재 조회
            List<Approval> approvalList = approvalRepository.findByRequesterIdAndApprStatCd(userid, "IN_PROGRESS");
            
            if (approvalList.isEmpty()) {
                log.info("내 결재 신청 데이터가 없습니다: userid={}", userid);
                return Collections.emptyList();
            }
            
            List<MyApprovalRequestDto> result = new ArrayList<>();
            
            for (Approval approval : approvalList) {
                String taskTypeInfo = getTaskTypeInfo(approval.getTaskTypeCd());
                String statName = getStatusName(approval.getApprStatCd(), "APPR_STAT_CD");
                String approverName = getUserName(approval.getApproverId());
                
                result.add(MyApprovalRequestDto.builder()
                    .approvalId(approval.getApprovalId())
                    .taskTypeCd(approval.getTaskTypeCd())
                    .taskTypeInfo(taskTypeInfo)
                    .taskId(approval.getTaskId())
                    .apprStatCd(approval.getApprStatCd())
                    .apprStatName(statName)
                    .requestDatetime(approval.getRequestDatetime())
                    .approverId(approval.getApproverId())
                    .approverName(approverName)
                    .comments(approval.getComments())
                    .build());
            }
            
            log.debug("내 결재 신청 목록 조회 완료 (로그인 아이디 기준): userid={}, 건수={}", userid, result.size());
            return result;
            
        } catch (Exception e) {
            log.error("내 결재 신청 목록 조회 중 오류 발생: userid={}", userid, e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 처리 대기 결재 목록 조회 (로그인 아이디 기준)
     * 쿼리: SELECT * FROM approval_steps WHERE approver_id = 'bossuser02' AND step_status = 'PENDING'
     */
    @Override
    public List<PendingApprovalDto> getPendingApprovalsByUserid(String userid) {
        log.debug("처리 대기 결재 목록 조회 시작 (로그인 아이디 기준): userid={}", userid);
        
        try {
            // ApprovalStep repository를 사용하여 실제 데이터 조회
            List<ApprovalStep> pendingSteps = approvalStepRepository.findPendingStepsByApprover(userid);
            
            if (pendingSteps.isEmpty()) {
                log.info("처리 대기 결재가 없습니다: userid={}", userid);
                return Collections.emptyList();
            }
            
            List<PendingApprovalDto> pendingList = new ArrayList<>();
            
            for (ApprovalStep step : pendingSteps) {
                Approval approval = step.getApproval();
                
                String taskTypeInfo = getTaskTypeInfo(approval.getTaskTypeCd());
                
                pendingList.add(PendingApprovalDto.builder()
                    .approvalId(approval.getApprovalId())
                    .taskTypeCd(approval.getTaskTypeCd())
                    .taskTypeInfo(taskTypeInfo)
                    .taskId(approval.getTaskId())
                    .requesterId(approval.getRequesterId())
                    .requesterName(getUserName(approval.getRequesterId()))
                    .requestDatetime(approval.getRequestDatetime())
                    .comments(approval.getComments())
                    .urgency(approval.getUrgencyCd())
                    .build());
            }
            
            log.debug("처리 대기 결재 목록 조회 완료 (로그인 아이디 기준): userid={}, 건수={}", userid, pendingList.size());
            return pendingList;
            
        } catch (Exception e) {
            log.error("처리 대기 결재 목록 조회 중 오류 발생: userid={}", userid, e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 공통코드로 상태명 조회
     */
    private String getStatusName(String statusCd, String codeGroup) {
        try {
            return commonCodeRepository.findByGroupCodeAndCode(codeGroup, statusCd)
                .map(commonCode -> commonCode.getCodeName())
                .orElse(statusCd);
        } catch (Exception e) {
            log.warn("상태명 조회 실패: statusCd={}, codeGroup={}", statusCd, codeGroup, e);
            return statusCd;
        }
    }
    
    /**
     * 업무 유형 코드를 업무명으로 변환
     */
    private String getTaskTypeInfo(String taskTypeCd) {
        if (taskTypeCd == null) return "알 수 없음";
        
        switch (taskTypeCd) {
            case "RESPONSIBILITY_DOC": return "책무기술서 승인";
            case "AUDIT_RESULT": return "점검 결과 승인";
            case "INTERNAL_CONTROL": return "내부통제 승인";
            case "BUSINESS_PLAN": return "사업계획 승인";
            case "LEDGER_MANAGEMENT": return "원장관리 승인";
            default: return taskTypeCd;
        }
    }
    
    /**
     * 사용자 ID로 사용자명 조회 (임시 구현)
     */
    private String getUserName(String userId) {
        // 실제로는 Employee repository를 통해 조회해야 함
        if (userId == null) return "알 수 없음";
        
        // 임시로 ID를 기반으로 이름 생성
        switch (userId) {
            case "USER001": return "홍길동";
            case "USER002": return "김영희";
            case "USER003": return "박철수";
            case "MANAGER001": return "김부장";
            default: return userId;
        }
    }
    
    /**
     * 카테고리 코드를 카테고리명으로 변환
     */
    private String getCategoryName(String category) {
        if (category == null) return null;
        
        // common_code.group_code = 'CATEGORY'에서 조회
        return commonCodeRepository.findByGroupCodeAndCode("CATEGORY", category)
            .map(commonCode -> commonCode.getCodeName())
            .orElse(category);
    }
    
    /**
     * QnA 상태 코드를 상태명으로 변환
     */
    private String getQnaStatusName(String status) {
        if (status == null) return null;
        
        // common_code.group_code = 'QNA_STATUS'에서 조회
        return commonCodeRepository.findByGroupCodeAndCode("QNA_STATUS", status)
            .map(commonCode -> commonCode.getCodeName())
            .orElse(status);
    }
}