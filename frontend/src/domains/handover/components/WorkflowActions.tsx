/**
 * 워크플로 액션 컴포넌트
 * 인수인계 및 문서 워크플로 액션 버튼들을 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 워크플로 액션 버튼 그룹 관리만 담당
 * - Open/Closed: 새로운 액션 추가 시 확장 가능
 * - Liskov Substitution: React 컴포넌트 인터페이스 준수
 * - Interface Segregation: 워크플로 액션 관련 기능만 제공
 * - Dependency Inversion: Material-UI 컴포넌트에 의존
 */

import React from 'react';
import {
  Button,
  ButtonGroup,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  Send as SendIcon,
  Check as ApproveIcon,
  Publish as PublishIcon,
  Undo as RevertIcon,
  Update as UpdateIcon,
  Assessment as ProgressIcon,
} from '@mui/icons-material';
import { StatusType } from './StatusChip';

// 액션 타입 정의
export type ActionType = 
  | 'edit' | 'start' | 'complete' | 'cancel'
  | 'submit' | 'approve' | 'publish' | 'revert'
  | 'updateVersion' | 'updateProgress';

interface Action {
  type: ActionType;
  label: string;
  icon: React.ReactNode;
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  variant?: 'text' | 'outlined' | 'contained';
  disabled?: boolean;
  tooltip?: string;
  onClick: () => void;
}

interface WorkflowActionsProps {
  status: StatusType;
  actions?: Partial<Record<ActionType, () => void>>;
  disabled?: boolean;
  layout?: 'stack' | 'group';
  size?: 'small' | 'medium' | 'large';
}

// 액션별 기본 설정
const actionConfig: Record<ActionType, {
  label: string;
  icon: React.ReactNode;
  color: Action['color'];
  variant: Action['variant'];
}> = {
  edit: {
    label: '수정',
    icon: <EditIcon />,
    color: 'primary',
    variant: 'outlined',
  },
  start: {
    label: '시작',
    icon: <StartIcon />,
    color: 'info',
    variant: 'contained',
  },
  complete: {
    label: '완료',
    icon: <CompleteIcon />,
    color: 'success',
    variant: 'contained',
  },
  cancel: {
    label: '취소',
    icon: <CancelIcon />,
    color: 'error',
    variant: 'outlined',
  },
  submit: {
    label: '검토 요청',
    icon: <SendIcon />,
    color: 'warning',
    variant: 'contained',
  },
  approve: {
    label: '승인',
    icon: <ApproveIcon />,
    color: 'info',
    variant: 'contained',
  },
  publish: {
    label: '발행',
    icon: <PublishIcon />,
    color: 'success',
    variant: 'contained',
  },
  revert: {
    label: '되돌리기',
    icon: <RevertIcon />,
    color: 'warning',
    variant: 'outlined',
  },
  updateVersion: {
    label: '버전 업데이트',
    icon: <UpdateIcon />,
    color: 'primary',
    variant: 'outlined',
  },
  updateProgress: {
    label: '진행률 업데이트',
    icon: <ProgressIcon />,
    color: 'info',
    variant: 'outlined',
  },
};

// 상태별 사용 가능한 액션 정의
const statusActions: Record<StatusType, ActionType[]> = {
  // 인수인계 상태
  PLANNED: ['edit', 'start', 'cancel'],
  IN_PROGRESS: ['updateProgress', 'complete', 'cancel'],
  COMPLETED: [],
  CANCELLED: [],
  
  // 문서 상태
  DRAFT: ['edit', 'submit'],
  REVIEW: ['approve', 'revert'],
  APPROVED: ['publish', 'revert'],
  PUBLISHED: ['updateVersion'],
};

const WorkflowActions: React.FC<WorkflowActionsProps> = ({
  status,
  actions = {},
  disabled = false,
  layout = 'stack',
  size = 'medium',
}) => {
  // 현재 상태에서 사용 가능한 액션들
  const availableActions = statusActions[status] || [];
  
  // 실제 액션 버튼 생성
  const actionButtons = availableActions
    .filter(actionType => actions[actionType]) // 핸들러가 제공된 액션만
    .map(actionType => {
      const config = actionConfig[actionType];
      const handler = actions[actionType]!;
      
      const button = (
        <Button
          key={actionType}
          startIcon={config.icon}
          color={config.color}
          variant={config.variant}
          size={size}
          disabled={disabled}
          onClick={handler}
        >
          {config.label}
        </Button>
      );

      // 툴팁이 있는 경우
      if (disabled) {
        return (
          <Tooltip key={actionType} title="권한이 없거나 현재 상태에서 사용할 수 없습니다">
            <span>{button}</span>
          </Tooltip>
        );
      }

      return button;
    });

  if (actionButtons.length === 0) {
    return null;
  }

  // 레이아웃에 따른 렌더링
  if (layout === 'group') {
    return (
      <ButtonGroup variant="outlined" size={size}>
        {actionButtons}
      </ButtonGroup>
    );
  }

  return (
    <Stack direction="row" spacing={1}>
      {actionButtons}
    </Stack>
  );
};

export default WorkflowActions;