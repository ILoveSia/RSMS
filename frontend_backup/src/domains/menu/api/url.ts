/**
 * 메뉴 관련 API URL 정의
 */
export const MENU_API_URL = {
  GET_ALL_MENUS: '/menus',
  GET_ACCESSIBLE_MENUS: '/menus/accessible',
  GET_MENU_HIERARCHY: '/menus/hierarchy',
  GET_ROOT_MENUS: '/menus/root',
  GET_CHILD_MENUS: (parentId: number) => `/menus/${parentId}/children`,
  GET_MENU_BY_CODE: (menuCode: string) => `/menus/code/${menuCode}`,
  SEARCH_MENUS: '/menus/search',
}; 