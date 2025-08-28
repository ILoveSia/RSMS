/**
 * 업무페이지 공통 액션 버튼 그룹 컴포넌트
 * 조회, 등록, 삭제 등 자주 사용되는 버튼들을 제공합니다.
 */
import React from 'react';
import {
  Box,
} from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import Button from './Button';

// 버튼 타입 정의
export type ActionButtonType = 
  | 'search'      // 조회
  | 'register'    // 등록
  | 'delete'      // 삭제
  | 'refresh'     // 새로고침
  | 'edit'        // 수정
  | 'save'        // 저장
  | 'cancel'      // 취소
  | 'custom';     // 사용자 정의

// 개별 버튼 설정 인터페이스
export interface ActionButtonConfig {
  type: ActionButtonType;
  label?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  color?: ButtonProps['color'];
  variant?: ButtonProps['variant'];
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  hidden?: boolean;
}

// 컴포넌트 Props 인터페이스
export interface ActionButtonGroupProps {
  buttons: ActionButtonConfig[];
  direction?: 'row' | 'column';
  spacing?: number;
  align?: 'left' | 'center' | 'right';
  sx?: any;
}

// 기본 버튼 설정
const DEFAULT_BUTTON_CONFIG: Record<ActionButtonType, Partial<ActionButtonConfig>> = {
  search: {
    label: '조회',
    color: 'primary',
    variant: 'contained',
    icon: <SearchIcon />,
  },
  register: {
    label: '등록',
    color: 'success',
    variant: 'contained',
    icon: <AddIcon />,
  },
  delete: {
    label: '삭제',
    color: 'error',
    variant: 'contained',
    icon: <DeleteIcon />,
  },
  refresh: {
    label: '새로고침',
    color: 'primary',
    variant: 'outlined',
    icon: <RefreshIcon />,
  },
  edit: {
    label: '수정',
    color: 'warning',
    variant: 'contained',
    icon: <EditIcon />,
  },
  save: {
    label: '저장',
    color: 'success',
    variant: 'contained',
    icon: <SaveIcon />,
  },
  cancel: {
    label: '취소',
    color: 'inherit',
    variant: 'outlined',
    icon: <CancelIcon />,
  },
  custom: {
    label: '버튼',
    color: 'primary',
    variant: 'contained',
  },
};

/**
 * 액션 버튼 그룹 컴포넌트
 */
const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  buttons,
  direction = 'row',
  spacing = 1,
  align = 'right',
  sx,
}) => {
  // 숨겨진 버튼 필터링
  const visibleButtons = buttons.filter(button => !button.hidden);

  if (visibleButtons.length === 0) {
    return null;
  }

  // 정렬 설정
  const getJustifyContent = () => {
    switch (align) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
      default:
        return 'flex-end';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: direction,
        gap: spacing,
        justifyContent: getJustifyContent(),
        alignItems: 'center',
        ...sx,
      }}
    >
      {visibleButtons.map((buttonConfig, index) => {
        const defaultConfig = DEFAULT_BUTTON_CONFIG[buttonConfig.type];
        const mergedConfig = { ...defaultConfig, ...buttonConfig };

        return (
          <Button
            key={`${buttonConfig.type}-${index}`}
            variant={mergedConfig.variant}
            color={mergedConfig.color}
            size="small"
            disabled={mergedConfig.disabled || mergedConfig.loading}
            onClick={mergedConfig.onClick}
            startIcon={mergedConfig.startIcon || mergedConfig.icon}
            endIcon={mergedConfig.endIcon}
            sx={{
              minWidth: '80px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {mergedConfig.loading ? '처리중...' : mergedConfig.label}
          </Button>
        );
      })}
    </Box>
  );
};

export default ActionButtonGroup;