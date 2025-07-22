import url from '@/domains/common/api/url';
import type { IRootState } from '@/app/types';
import { registerActions } from '@/app/store';

// 공통코드 스토어 타입 ==============
export interface ICommonCodeStore <T = IRootState> {
	allCodes: T;              // 모든 공통코드
	usableCodes: T;           // 사용 가능한 공통코드
	groupedCodes: T;          // 그룹별 공통코드
	usableGroupedCodes: T;    // 사용 가능한 그룹별 공통코드
	groupCodes: T;            // 그룹코드 목록
	usableGroupCodes: T;      // 사용 가능한 그룹코드 목록
}

// 공통코드 Action 객체 ======================
// 생성할 Store state의 이름을 정하고, 값으로 actionType과 url을 입력한다.
// API호출이 아닌 경우에는 url을 입력 하지 않아도 된다. (state만 생성할때)
// actionType 이름을 [업무스토어]/[state 이름] 조합으로 생성한다.
const codeAction = {
	allCodes: {actionType: 'codeStore/allCodes', url: url.GET_ALL_COMMON_CODES },    // 모든 공통코드 조회
	usableCodes: {actionType: 'codeStore/usableCodes', url: url.GET_USABLE_COMMON_CODES },    // 사용 가능한 공통코드 조회
	groupedCodes: {actionType: 'codeStore/groupedCodes', url: url.GET_GROUPED_COMMON_CODES },    // 그룹별 공통코드 조회
	usableGroupedCodes: {actionType: 'codeStore/usableGroupedCodes', url: url.GET_USABLE_GROUPED_COMMON_CODES },    // 사용 가능한 그룹별 공통코드 조회
	groupCodes: {actionType: 'codeStore/groupCodes', url: url.GET_GROUP_CODES },    // 그룹코드 목록 조회
	usableGroupCodes: {actionType: 'codeStore/usableGroupCodes', url: url.GET_USABLE_GROUP_CODES },    // 사용 가능한 그룹코드 목록 조회
	// action 추가...
} as const;

// 액션을 전역 레지스트리에 등록
registerActions(codeAction);

export default codeAction; 