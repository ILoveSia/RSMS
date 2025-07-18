import { MENU_API_URL } from '@/domains/menu/api/url';
import type { IRootState, IActionObject } from '@/app/types';
import { registerActions } from '@/app/store';

// 메뉴 스토어 타입
export interface IMenuStore<T = IRootState> {
	[key: string]: T;
	accessibleMenus: T;
	menuHierarchy: T;
}

// 메뉴 Action 객체
const menuAction: IMenuStore<IActionObject> = {
	accessibleMenus: { actionType: 'MenuStore/accessibleMenus', url: MENU_API_URL.GET_ACCESSIBLE_MENUS },
	menuHierarchy: { actionType: 'MenuStore/menuHierarchy', url: MENU_API_URL.GET_MENU_HIERARCHY },
	// 다른 메뉴 관련 액션 추가
} as const;

// 액션을 전역 레지스트리에 등록
registerActions(menuAction);

export default menuAction; 