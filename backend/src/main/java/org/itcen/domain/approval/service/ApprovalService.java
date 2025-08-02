package org.itcen.domain.approval.service;

import java.util.List;
import org.itcen.domain.approval.dto.ApprovalDto;

/**
 * 결재 서비스 인터페이스
 * 
 * SOLID 원칙:
 * - 단일 책임: 결재 비즈니스 로직만 정의
 * - 개방-폐쇄: 새로운 결재 기능 추가 시 확장 가능
 * - 리스코프 치환: 구현체 교체 가능
 * - 인터페이스 분리: 결재 관련 기능만 정의
 * - 의존성 역전: 인터페이스에 의존하도록 설계
 */
public interface ApprovalService {

    /**
     * 결재 상신
     * 
     * @param request 결재 상신 요청 정보
     * @return 상신 결과
     */
    ApprovalDto.SubmitResponse submitApproval(ApprovalDto.SubmitRequest request);

    /**
     * 결재 처리 (승인/반려)
     * 
     * @param request 결재 처리 요청 정보
     * @return 처리 결과
     */
    ApprovalDto.ProcessResponse processApproval(ApprovalDto.ProcessRequest request);

    /**
     * 결재 취소
     * 
     * @param approvalId 결재 ID
     * @param requesterId 요청자 ID (권한 확인용)
     * @return 취소 결과
     */
    ApprovalDto.ProcessResponse cancelApproval(Long approvalId, String requesterId);

    /**
     * 결재 상태 조회
     * 
     * @param taskTypeCd 업무 유형 코드
     * @param taskId 업무 ID
     * @return 결재 상태 정보
     */
    ApprovalDto.StatusResponse getApprovalStatus(String taskTypeCd, Long taskId);

    /**
     * 결재 상세 정보 조회
     * 
     * @param approvalId 결재 ID
     * @return 결재 상세 정보
     */
    ApprovalDto.StatusResponse getApprovalDetail(Long approvalId);

    /**
     * 내 결재 대기 목록 조회
     * 
     * @param approverId 결재자 ID
     * @return 결재 대기 목록
     */
    List<ApprovalDto.ListResponse> getMyPendingApprovals(String approverId);

    /**
     * 내가 요청한 결재 목록 조회
     * 
     * @param requesterId 요청자 ID
     * @return 요청한 결재 목록
     */
    List<ApprovalDto.ListResponse> getMyRequestedApprovals(String requesterId);

    /**
     * 내 결재 처리 이력 조회
     * 
     * @param approverId 결재자 ID
     * @return 처리 이력 목록
     */
    List<ApprovalDto.HistoryResponse> getMyApprovalHistory(String approverId);

    /**
     * 전체 결재 목록 조회 (관리자용)
     * 
     * @return 전체 결재 목록
     */
    List<ApprovalDto.ListResponse> getAllApprovals();

    /**
     * 결재 대시보드 요약 정보 조회
     * 
     * @param userId 사용자 ID (개인화된 정보를 위해)
     * @return 대시보드 요약 정보
     */
    ApprovalDto.SummaryResponse getApprovalSummary(String userId);

    /**
     * 결재자 목록 조회
     * 
     * @return 결재 가능한 사용자 목록
     */
    List<ApprovalDto.ApproverInfo> getAvailableApprovers();

    /**
     * 업무 유형별 결재 통계 조회
     * 
     * @param taskTypeCd 업무 유형 코드 (null이면 전체)
     * @return 결재 통계 정보
     */
    List<ApprovalDto.StatisticsResponse> getApprovalStatistics(String taskTypeCd);

    /**
     * 지연 결재 목록 조회
     * 
     * @param days 지연 기준 일수
     * @return 지연 결재 목록
     */
    List<ApprovalDto.ListResponse> getDelayedApprovals(Integer days);

    /**
     * 특정 사용자가 특정 업무에 대해 결재할 권한이 있는지 확인
     * 
     * @param approverId 결재자 ID
     * @param taskTypeCd 업무 유형 코드
     * @param taskId 업무 ID
     * @return 결재 권한 여부
     */
    boolean hasApprovalAuthority(String approverId, String taskTypeCd, Long taskId);

    /**
     * 결재 라인 미리보기
     * 
     * @param approvers 결재자 목록
     * @return 결재 라인 정보
     */
    List<ApprovalDto.StepInfo> previewApprovalLine(List<String> approvers);
}