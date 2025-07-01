import { MAIN_API_URL } from '@/domains/main/api/url';
import type { IRootState, IActionObject } from '@/app/types';

// 공통업무 (cm-cb) 스토어 타입 ==============
export interface IMainStore <T = IRootState> {
	[key: string]: T;
	main: T;
}

// cm-cb Action 객체 ======================
// 생성할 Store state의 이름을 정하고, 값으로 actionType과 url을 입력한다.
// API호출이 아닌 경우에는 url을 입력 하지 않아도 된다. (state만 생성할때)
// actionType 이름을 [업무스토어]/[state 이름] 조합으로 생성한다.
const mainAction : IMainStore<IActionObject> = {
	main: {actionType: 'MainStore/login', url: MAIN_API_URL.EX_API },    // action 등록 예제 코드
	// action  추가...
} as const;

export default mainAction;