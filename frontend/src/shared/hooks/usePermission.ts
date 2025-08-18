import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/app/common/api/client';

/**
 * 메뉴 권한 정보 타입
 */
export interface MenuPermission {
  menuId: number;
  menuCode: string;
  menuName: string;
  menuUrl: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  roles: string;
}

/**
 * usePermission 훅 반환 타입
 */
export interface UsePermissionReturn {
  permissions: MenuPermission[];
  loading: boolean;
  hasMenuPermission: (menuCode: string, permission: 'read' | 'write' | 'delete') => boolean;
  hasUrlPermission: (url: string, permission: 'read' | 'write' | 'delete') => boolean;
  refreshPermissions: () => Promise<void>;
}

/**
 * 권한 체크 커스텀 훅
 * 
 * 사용자의 메뉴별 권한 정보를 관리하고, 권한 체크 기능을 제공합니다.
 * 
 * 주요 기능:
 * - 현재 사용자의 메뉴별 권한 조회
 * - 메뉴 코드/URL 기반 권한 체크
 * - 권한 데이터 캐싱 및 새로고침
 * 
 * @returns UsePermissionReturn 권한 체크 기능과 상태
 */
export const usePermission = (): UsePermissionReturn => {
  const [permissions, setPermissions] = useState<MenuPermission[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 사용자 권한 데이터 로드
   */
  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      
      // TODO: 실제로는 현재 로그인 사용자 정보를 가져와야 함
      // 임시로 admin 사용자 사용
      const response = await apiClient.get<MenuPermission[]>('/admin/current-user/menu-permissions', {
        params: { userId: 'admin' }
      });
      
      setPermissions(response || []);
      
      // 권한 데이터 캐싱 (세션 스토리지에 저장)
      sessionStorage.setItem('userPermissions', JSON.stringify(response || []));
      
      
    } catch (error) {
      console.error('권한 데이터 로드 실패:', error);
      
      // 캐시된 데이터 사용 시도
      const cached = sessionStorage.getItem('userPermissions');
      if (cached) {
        try {
          const cachedPermissions = JSON.parse(cached);
          setPermissions(cachedPermissions);
          
        } catch (parseError) {
          console.error('캐시된 권한 데이터 파싱 실패:', parseError);
          setPermissions([]);
        }
      } else {
        setPermissions([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 컴포넌트 마운트 시 권한 데이터 로드
   */
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  /**
   * 메뉴 코드 기반 권한 체크
   * 
   * @param menuCode 메뉴 코드 (예: "LEDGER_MGMT")
   * @param permission 확인할 권한 유형
   * @returns 권한 보유 여부
   */
  const hasMenuPermission = useCallback((menuCode: string, permission: 'read' | 'write' | 'delete'): boolean => {
    if (loading || !menuCode) {
      return false;
    }

    const menuPerm = permissions.find(p => p.menuCode === menuCode);
    if (!menuPerm) {
      console.warn(`메뉴 코드를 찾을 수 없습니다: ${menuCode}`);
      return false;
    }

    switch (permission) {
      case 'read':
        return menuPerm.canRead;
      case 'write':
        return menuPerm.canWrite;
      case 'delete':
        return menuPerm.canDelete;
      default:
        return false;
    }
  }, [permissions, loading]);

  /**
   * URL 기반 권한 체크
   * 
   * @param url 메뉴 URL (예: "/ledger/positions")
   * @param permission 확인할 권한 유형
   * @returns 권한 보유 여부
   */
  const hasUrlPermission = useCallback((url: string, permission: 'read' | 'write' | 'delete'): boolean => {
    if (loading || !url) {
      return false;
    }

    // URL 정규화 (앞뒤 슬래시 제거)
    const normalizedUrl = url.replace(/^\/+|\/+$/g, '');
    
    const menuPerm = permissions.find(p => {
      if (!p.menuUrl) return false;
      const normalizedMenuUrl = p.menuUrl.replace(/^\/+|\/+$/g, '');
      return normalizedMenuUrl === normalizedUrl;
    });

    if (!menuPerm) {
      console.warn(`URL에 해당하는 메뉴를 찾을 수 없습니다: ${url}`);
      return false;
    }

    switch (permission) {
      case 'read':
        return menuPerm.canRead;
      case 'write':
        return menuPerm.canWrite;
      case 'delete':
        return menuPerm.canDelete;
      default:
        return false;
    }
  }, [permissions, loading]);

  /**
   * 권한 데이터 새로고침
   */
  const refreshPermissions = useCallback(async () => {
    
    await loadPermissions();
  }, [loadPermissions]);

  return {
    permissions,
    loading,
    hasMenuPermission,
    hasUrlPermission,
    refreshPermissions,
  };
};

export default usePermission;