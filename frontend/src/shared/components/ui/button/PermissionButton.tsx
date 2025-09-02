import React from 'react';
import Button, { type ButtonProps } from './Button';
import { PermissionGuard } from '../layout/PermissionGuard';
import { Tooltip } from '@mui/material';

/**
 * 권한 기반 버튼 컴포넌트 Props
 */
export interface PermissionButtonProps extends Omit<ButtonProps, 'variant'> {
  /**
   * 메뉴 코드 기반 권한 체크
   */
  menuCode?: string;
  
  /**
   * URL 기반 권한 체크
   */
  url?: string;
  
  /**
   * 확인할 권한 유형
   */
  permission?: 'read' | 'write' | 'delete';
  
  /**
   * 권한이 없을 때 버튼을 완전히 숨길지 여부
   * true: 버튼을 숨김 (기본값)
   * false: 버튼을 비활성화하고 툴팁 표시
   */
  hideWhenNoPermission?: boolean;
  
  /**
   * 권한이 없을 때 표시할 툴팁 메시지
   */
  noPermissionTooltip?: string;
  
  /**
   * 권한 체크를 건너뛸지 여부
   * 개발/테스트 목적으로 사용
   */
  skipPermissionCheck?: boolean;
  
  /**
   * 버튼 변형 (기본값: outlined)
   */
  variant?: 'text' | 'outlined' | 'contained';
}

/**
 * 권한 기반 버튼 컴포넌트
 * 
 * 사용자의 권한에 따라 버튼을 조건부 렌더링하거나 비활성화합니다.
 * 
 * 사용 예시:
 * ```tsx
 * // 권한이 없으면 버튼 숨김
 * <PermissionButton 
 *   menuCode="LEDGER_MGMT" 
 *   permission="write"
 *   variant="contained"
 *   onClick={handleCreate}
 * >
 *   책무번호생성
 * </PermissionButton>
 * 
 * // 권한이 없으면 버튼 비활성화 + 툴팁
 * <PermissionButton 
 *   menuCode="LEDGER_MGMT" 
 *   permission="delete"
 *   hideWhenNoPermission={false}
 *   noPermissionTooltip="삭제 권한이 없습니다"
 *   variant="outlined"
 *   onClick={handleDelete}
 * >
 *   삭제
 * </PermissionButton>
 * ```
 * 
 * @param props PermissionButtonProps
 * @returns 권한에 따른 조건부 버튼 렌더링
 */
export const PermissionButton: React.FC<PermissionButtonProps> = ({
  children,
  menuCode,
  url,
  permission = 'read',
  hideWhenNoPermission = true,
  noPermissionTooltip = '권한이 없습니다',
  skipPermissionCheck = false,
  disabled,
  variant = 'outlined',
  ...buttonProps
}) => {
  
  // 권한 체크가 필요하지 않은 경우 기본 Button 렌더링
  if (skipPermissionCheck || (!menuCode && !url)) {
    return (
      <Button disabled={disabled} variant={variant} {...buttonProps}>
        {children}
      </Button>
    );
  }

  // 권한이 없을 때 버튼을 숨기는 경우
  if (hideWhenNoPermission) {
    return (
      <PermissionGuard
        menuCode={menuCode}
        url={url}
        permission={permission}
        skipPermissionCheck={skipPermissionCheck}
      >
        <Button disabled={disabled} variant={variant} {...buttonProps}>
          {children}
        </Button>
      </PermissionGuard>
    );
  }

  // 권한이 없을 때 버튼을 비활성화하고 툴팁을 표시하는 경우
  return (
    <PermissionGuard
      menuCode={menuCode}
      url={url}
      permission={permission}
      skipPermissionCheck={skipPermissionCheck}
      fallback={
        <Tooltip title={noPermissionTooltip}>
          <span>
            <Button 
              disabled={true} 
              variant={variant}
              {...buttonProps}
            >
              {children}
            </Button>
          </span>
        </Tooltip>
      }
    >
      <Button disabled={disabled} variant={variant} {...buttonProps}>
        {children}
      </Button>
    </PermissionGuard>
  );
};

export default PermissionButton;