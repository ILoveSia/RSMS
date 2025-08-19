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

/**
 * 메뉴 관리 API
 */
export const menuApi = {
  /**
   * 모든 메뉴와 부모 메뉴 정보 조회 (관리용)
   */
  getAllMenusWithParent: async (): Promise<MenuWithParent[]> => {
    try {
      const response = await apiClient.get('/menus/all-with-parent');
      console.log('API 응답:', response);
      return response as MenuWithParent[];
    } catch (error) {
      console.error('메뉴 조회 실패:', error);
      throw error;
    }
  },

  /**
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
