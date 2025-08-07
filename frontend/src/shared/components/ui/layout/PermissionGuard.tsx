import React from 'react';
import { usePermission } from '@/shared/hooks/usePermission';

/**
 * 권한 기반 컴포넌트 래퍼 props
 */
interface PermissionGuardProps {
  /**
   * 권한이 있을 때 렌더링할 컴포넌트
   */
  children: React.ReactNode;
  
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
  permission: 'read' | 'write' | 'delete';
  
  /**
   * 권한이 없을 때 표시할 컴포넌트
   * 기본값: null (아무것도 렌더링하지 않음)
   */
  fallback?: React.ReactNode;
  
  /**
   * 로딩 중일 때 표시할 컴포넌트
   * 기본값: null (아무것도 렌더링하지 않음)
   */
  loadingComponent?: React.ReactNode;
  
  /**
   * 권한 체크를 건너뛸지 여부
   * 개발/테스트 목적으로 사용
   */
  skipPermissionCheck?: boolean;
}

/**
 * 권한 기반 컴포넌트 래퍼
 * 
 * 사용자의 권한에 따라 자식 컴포넌트를 조건부 렌더링합니다.
 * 
 * 사용 예시:
 * ```tsx
 * <PermissionGuard menuCode="LEDGER_MGMT" permission="write">
 *   <Button>책무번호생성</Button>
 * </PermissionGuard>
 * 
 * <PermissionGuard 
 *   url="/ledger/positions" 
 *   permission="delete"
 *   fallback={<Typography>권한이 없습니다</Typography>}
 * >
 *   <Button>삭제</Button>
 * </PermissionGuard>
 * ```
 * 
 * @param props PermissionGuardProps
 * @returns 권한에 따른 조건부 렌더링 결과
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  menuCode,
  url,
  permission,
  fallback = null,
  loadingComponent = null,
  skipPermissionCheck = false,
}) => {
  const { hasMenuPermission, hasUrlPermission, loading } = usePermission();

  // 개발/테스트 모드에서 권한 체크 건너뛰기
  if (skipPermissionCheck) {
    return <>{children}</>;
  }

  // 로딩 중일 때
  if (loading) {
    return <>{loadingComponent}</>;
  }

  // 권한 체크 로직
  let hasPermission = false;

  if (menuCode) {
    hasPermission = hasMenuPermission(menuCode, permission);
  } else if (url) {
    hasPermission = hasUrlPermission(url, permission);
  } else {
    console.warn('PermissionGuard: menuCode 또는 url 중 하나는 반드시 제공되어야 합니다.');
    return <>{fallback}</>;
  }

  // 권한이 있으면 children 렌더링, 없으면 fallback 렌더링
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;