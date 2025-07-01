/**
 * 간소화된 라우터 유틸리티
 * React Router의 기본 기능을 활용한 간단한 라우터 헬퍼
 */
import { useNavigate, useLocation } from 'react-router-dom';

// 라우터 유틸리티 클래스
export class RouterUtil {
	private static navigate: ReturnType<typeof useNavigate> | null = null;
	private static location: ReturnType<typeof useLocation> | null = null;

	// 네비게이션 인스턴스 설정
	public static setNavigate(navigate: ReturnType<typeof useNavigate>): void {
		this.navigate = navigate;
	}

	// 로케이션 인스턴스 설정
	public static setLocation(location: ReturnType<typeof useLocation>): void {
		this.location = location;
	}
	
	// 페이지 이동
	public static push(path: string, options?: { replace?: boolean; state?: unknown }): void {
		if (!this.navigate) {
			console.error('[Router] Navigate instance not set');
			return;
		}
		this.navigate(path, options);
	}
	
	// 뒤로 가기
	public static goBack(): void {
		if (!this.navigate) {
			console.error('[Router] Navigate instance not set');
			return;
		}
		this.navigate(-1);
	}
	
	// 현재 경로 가져오기
	public static getCurrentPath(): string {
		return this.location?.pathname || '';
	}

	// 외부 링크 열기
	public static openExternal(url: string, target = '_blank'): void {
		window.open(url, target);
	}
}

// 라우터 훅 (컴포넌트에서 사용)
export const useRouter = () => {
	const navigate = useNavigate();
	const location = useLocation();

	// 라우터 유틸리티에 인스턴스 설정
	RouterUtil.setNavigate(navigate);
	RouterUtil.setLocation(location);

	return {
		push: (path: string, options?: { replace?: boolean; state?: unknown }) => 
			navigate(path, options),
		goBack: () => navigate(-1),
		location,
		pathname: location.pathname,
		search: location.search,
		state: location.state,
	};
};

export default RouterUtil;


