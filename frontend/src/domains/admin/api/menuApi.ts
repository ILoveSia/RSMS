import { apiClient } from '@/app/common/api/client';

export interface MenuWithParent {
  id: number;
  menuName: string;
  menuNameEn: string;
  parentId: number | null;
  parentName: string | null;
  sortOrder: number;
  description: string | null;
}

export interface MenuUpdateRequest {
  id: number;
  menuName: string;
  menuNameEn: string;
  description: string | null;
  parentId: number | null;
  sortOrder: number;
}

export interface MenuUpdateResponse {
  menu: MenuWithParent;
  orderChanged: boolean;
  infoChanged: boolean;
  success: boolean;
  errorMessage?: string;
}
export interface MenuDto {
  id: number;
  menuCode: string;
  menuName: string;
  menuNameEn: string;
  parentId: number | null;
  menuLevel: number;
  sortOrder: number;
  menuUrl: string;
  iconClass: string;
  isActive: boolean;
  isVisible: boolean;
  description: string;
  children?: MenuDto[];
  canRead?: boolean;
  canWrite?: boolean;
  canDelete?: boolean;
}
/**
 * 메뉴 관리 API
 */
export const menuApi = {

  getMenuHierarchy: async (): Promise<MenuDto[]> => {
    const response = await apiClient.get('/menus/hierarchy');
    return response as MenuDto[];
  },  /**
   * 메뉴 추가
   */
  createMenu: async (menuData: Partial<MenuWithParent>): Promise<MenuWithParent> => {
    const response = await apiClient.post('/menus', menuData);
    return response as MenuWithParent;
  },

  /**
   * 메뉴 업데이트 (정보 수정 및 순서 변경)
   */
  updateMenu: async (menuData: MenuUpdateRequest): Promise<MenuUpdateResponse> => {
    try {
      const response = await apiClient.put(`/menus/${menuData.id}`, menuData);
      return response as MenuUpdateResponse;
    } catch (error) {
      console.error('메뉴 업데이트 실패:', error);
      throw error;
    }
  },

  /**
   * 메뉴 삭제
   */
  deleteMenu: async (id: number): Promise<void> => {
    await apiClient.delete(`/menus/${id}`);
  },
};
