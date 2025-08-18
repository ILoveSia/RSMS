import { apiClient } from '@/app/common/api/client';

export interface MenuWithParent {
  id: number;
  menuName: string;
  menuNameEn: string;
  parentId: number | null;
  parentName: string | null;
  menuLevel: number;
  sortOrder: number;
  description: string | null;
}

/**
 * 메뉴 관리 API
 */
export const menuApi = {
  /**
   * 모든 메뉴와 부모 메뉴 정보 조회
   */
  getAllMenusWithParent: async (): Promise<MenuWithParent[]> => {
    try {
      const response = await apiClient.get('/menus/all-with-parent');
      console.log('API 응답:', response);
      return response as MenuWithParent[];
    } catch (error) {
      console.error('메뉴 API 호출 실패:', error);
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
   * 메뉴 수정
   */
  updateMenu: async (id: number, menuData: Partial<MenuWithParent>): Promise<MenuWithParent> => {
    const response = await apiClient.put(`/menus/${id}`, menuData);
    return response as MenuWithParent;
  },

  /**
   * 메뉴 삭제
   */
  deleteMenu: async (id: number): Promise<void> => {
    await apiClient.delete(`/menus/${id}`);
  },
};
