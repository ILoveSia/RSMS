/**
 * 스마트 결재 버튼 컴포넌트
 * 결재 상태에 따라 동적으로 버튼이 변경됩니다.
 */
import React, { useState, useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  Chip,
  Tooltip,
  CircularProgress,
  Box,
} from '@mui/material';
import {
  Send as SendIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import approvalApi, { type ApprovalStatusResponse } from '@/domains/approval/api/approvalApi';
import ApprovalSubmitPopup from './ApprovalSubmitPopup';
import InlineApprovalDialog from './InlineApprovalDialog';
import ApprovalStatusDialog from './ApprovalStatusDialog';

// 버튼 상태 타입
type ApprovalButtonState = 'SUBMIT' | 'APPROVE' | 'VIEW' | 'CANCELLED' | 'LOADING';

// Props 인터페이스
interface ApprovalActionButtonProps {
  taskType: string;
  taskId: number;
  taskTitle: string;
  currentUserId: string;
  onApprovalStateChange?: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
}

/**
 * 스마트 결재 액션 버튼
 */
const ApprovalActionButton: React.FC<ApprovalActionButtonProps> = ({
  taskType,
  taskId,
  taskTitle,
  currentUserId,
  onApprovalStateChange,
  size = 'small',
  variant = 'contained',
  disabled = false,
}) => {
  // 상태 관리
  const [buttonState, setButtonState] = useState<ApprovalButtonState>('LOADING');
  const [approvalData, setApprovalData] = useState<ApprovalStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // 팝업 상태
  const [submitPopupOpen, setSubmitPopupOpen] = useState(false);
  const [inlineDialogOpen, setInlineDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject'>('approve');

  // 결재 상태 확인
  const checkApprovalStatus = async () => {
    try {
      setLoading(true);
      const status = await approvalApi.getApprovalStatus(taskType, taskId);
      
      if (!status || status.status === 'NOT_SUBMITTED') {
        // 결재가 없거나 상신 전 상태인 경우 - 상신 가능
        setButtonState('SUBMIT');
        setApprovalData(null);
      } else {
        setApprovalData(status);
        
        // 내가 처리해야 할 단계인지 확인 (steps 배열 안전성 체크)
        const myPendingStep = status.steps && Array.isArray(status.steps) 
          ? status.steps.find(step => step.approverId === currentUserId && step.status === 'PENDING')
          : null;
        
        if (myPendingStep) {
          setButtonState('APPROVE');
        } else if (status.status === 'CANCELLED') {
          setButtonState('CANCELLED');
        } else {
          setButtonState('VIEW');
        }
      }
    } catch (error) {
      console.error('결재 상태 확인 실패:', error);
      setButtonState('SUBMIT'); // 기본값
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 상태 확인
  useEffect(() => {
    checkApprovalStatus();
  }, [taskType, taskId, currentUserId]);

  // 결재 상신 성공 핸들러
  const handleSubmitSuccess = (approvalId: number) => {
    setSubmitPopupOpen(false);
    checkApprovalStatus();
    onApprovalStateChange?.();
  };

  // 인라인 결재 처리 핸들러
  const handleInlineApproval = (action: 'approve' | 'reject') => {
    setPendingAction(action);
    setInlineDialogOpen(true);
  };

  // 결재 처리 확인 핸들러
  const handleApprovalConfirm = async (comments: string) => {
    if (!approvalData) return;

    try {
      setLoading(true);
      
      // 내가 처리해야 할 단계 찾기
      const myStep = approvalData.steps.find(
        step => step.approverId === currentUserId && step.status === 'PENDING'
      );
      
      if (!myStep?.stepId) {
        throw new Error('처리할 수 있는 결재 단계를 찾을 수 없습니다.');
      }

      // 결재 처리 API 호출
      await approvalApi.processApproval({
        stepId: myStep.stepId,
        action: pendingAction,
        comments: comments,
      });

      setInlineDialogOpen(false);
      checkApprovalStatus();
      onApprovalStateChange?.();
      
    } catch (error) {
      console.error('결재 처리 실패:', error);
      alert(`결재 처리에 실패했습니다: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 결재 현황 보기 핸들러
  const handleViewApproval = () => {
    setStatusDialogOpen(true);
  };

  // 버튼 렌더링
  const renderButton = () => {
    if (loading || buttonState === 'LOADING') {
      return (
        <Button
          size={size}
          variant={variant}
          disabled
          startIcon={<CircularProgress size={16} />}
          style={{
            height: '36px',
            minWidth: '80px',
            fontSize: '0.875rem',
            fontWeight: 600,
            borderRadius: '4px',
          }}
          sx={{
            height: '36px !important',
            minWidth: '80px !important',
            fontSize: '0.875rem !important',
            fontWeight: '600 !important',
            borderRadius: '4px !important',
          }}
        >
          로딩중
        </Button>
      );
    }

    switch (buttonState) {
      case 'SUBMIT':
        return (
          <Button
            size={size}
            variant={variant}
            color="primary"
            startIcon={<SendIcon />}
            onClick={() => setSubmitPopupOpen(true)}
            disabled={disabled}
            style={{
              height: '36px',
              minWidth: '80px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: '4px',
            }}
            sx={{
              height: '36px !important',
              minWidth: '80px !important',
              fontSize: '0.875rem !important',
              fontWeight: '600 !important',
              borderRadius: '4px !important',
            }}
          >
            결재 상신
          </Button>
        );
        
      case 'APPROVE':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="medium"
              variant="outlined"
              color="success"
              startIcon={<CheckIcon />}
              onClick={() => handleInlineApproval('approve')}
              disabled={disabled}
              style={{
                height: '36px',
                minWidth: '80px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '4px',
                padding: '6px 16px',
              }}
              sx={{
                height: '36px !important',
                minWidth: '80px !important',
                fontSize: '0.875rem !important',
                fontWeight: '600 !important',
                borderRadius: '4px !important',
                padding: '6px 16px !important',
              }}
            >
              승인
            </Button>
            <Button
              size="medium"
              variant="outlined"
              color="error"
              startIcon={<CloseIcon />}
              onClick={() => handleInlineApproval('reject')}
              disabled={disabled}
              style={{
                height: '36px',
                minWidth: '80px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '4px',
                padding: '6px 16px',
              }}
              sx={{
                height: '36px !important',
                minWidth: '80px !important',
                fontSize: '0.875rem !important',
                fontWeight: '600 !important',
                borderRadius: '4px !important',
                padding: '6px 16px !important',
              }}
            >
              반려
            </Button>
          </Box>
        );
        
      case 'VIEW':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size={size}
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={handleViewApproval}
              disabled={disabled}
              style={{
                height: '36px',
                minWidth: '80px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '4px',
              }}
              sx={{
                height: '36px !important',
                minWidth: '80px !important',
                fontSize: '0.875rem !important',
                fontWeight: '600 !important',
                borderRadius: '4px !important',
              }}
            >
              결재현황
            </Button>
            {approvalData && (
              <Tooltip title={`${approvalData.currentStep}/${approvalData.totalSteps}차 진행중`}>
                <Chip
                  size="small"
                  label={`${approvalData.currentStep || 0}/${approvalData.totalSteps}`}
                  color={getStatusColor(approvalData.status)}
                  icon={<HourglassEmptyIcon />}
                />
              </Tooltip>
            )}
          </Box>
        );
        
      case 'CANCELLED':
        return (
          <Button
            size={size}
            variant="outlined"
            color="inherit"
            startIcon={<UndoIcon />}
            onClick={handleViewApproval}
            disabled={disabled}
            sx={{
              height: '36px !important',
              minWidth: '80px !important',
              fontSize: '0.875rem !important',
              fontWeight: '600 !important',
              borderRadius: '4px !important',
            }}
          >
            취소됨
          </Button>
        );
        
      default:
        return null;
    }
  };

  // 상태에 따른 색상 반환
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'SUBMITTED':
      case 'IN_PROGRESS':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'info';
    }
  };

  return (
    <>
      {renderButton()}
      
      {/* 결재 상신 팝업 */}
      <ApprovalSubmitPopup
        open={submitPopupOpen}
        taskType={taskType}
        taskId={taskId}
        taskTitle={taskTitle}
        requesterId={currentUserId}
        onClose={() => setSubmitPopupOpen(false)}
        onSubmitSuccess={handleSubmitSuccess}
      />
      
      {/* 인라인 결재 처리 다이얼로그 */}
      {approvalData && (
        <InlineApprovalDialog
          open={inlineDialogOpen}
          approvalData={approvalData}
          action={pendingAction}
          onClose={() => setInlineDialogOpen(false)}
          onConfirm={handleApprovalConfirm}
        />
      )}
      
      {/* 결재 현황 다이얼로그 */}
      {approvalData && (
        <ApprovalStatusDialog
          open={statusDialogOpen}
          approvalData={approvalData}
          onClose={() => setStatusDialogOpen(false)}
        />
      )}
    </>
  );
};

export default ApprovalActionButton;