import { LOGIN_API_URL } from '@/domains/login/api/url';
import type { IRootState, IActionObject } from '@/app/types';
import { registerActions } from '@/app/store';

// 공통업무 (cm-cb) 스토어 타입 ==============
export interface ILoginStore <T = IRootState> {
	[key: string]: T;
	login: T;
}

// cm-cb Action 객체 ======================
// 생성할 Store state의 이름을 정하고, 값으로 actionType과 url을 입력한다.
// API호출이 아닌 경우에는 url을 입력 하지 않아도 된다. (state만 생성할때)
// actionType 이름을 [업무스토어]/[state 이름] 조합으로 생성한다.
const loginAction : ILoginStore<IActionObject> = {
	login: {actionType: 'LoginStore/login', url: LOGIN_API_URL.LOGIN },    // 사용자 조회 API
	// action  추가...
} as const;

// 액션을 전역 레지스트리에 등록
registerActions(loginAction);

export default loginAction;