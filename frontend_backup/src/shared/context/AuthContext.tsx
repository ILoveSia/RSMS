import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';

// 메뉴 인터페이스 추가
interface Menu {
  id: number;
  menuCode: string;
  menuName: string;
  menuNameEn?: string;
  parentId?: number;
  menuLevel: number;
  sortOrder: number;
  menuUrl?: string;
  iconClass?: string;
  isActive: boolean;
  isVisible: boolean;
  description?: string;
  children?: Menu[];
  canRead?: boolean;
  canWrite?: boolean;
  canDelete?: boolean;
}

// 사용자 인터페이스 (LoginPage의 User 인터페이스와 호환)
export interface User {
  userid: string;
  username: string;
  email: string;
  role?: string;
  roles?: string[];
}

// 인증 상태 인터페이스
export interface AuthState {
  isAuthenticated: boolean;
  user?: User;
  loading: boolean;
}

// 인증 컨텍스트 인터페이스
export interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  setAuthenticatedUser: (user: User) => void; // LoginPage에서 사용할 메서드 추가
  restoreMenuData: () => void; // 메뉴 데이터 복원 함수 추가
}

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 인증 프로바이더 Props
interface AuthProviderProps {
  children: ReactNode;
}

// Redux store dispatch 함수 (window 객체를 통해 접근)
const dispatchToStore = (action: { type: string; payload: unknown }) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = (window as any).__HOST_STORE__?.main;
    if (store && store.dispatch) {
      store.dispatch(action);
      console.log('📤 [AuthContext] Redux store에 액션 디스패치:', action.type);
    } else {
      console.warn('⚠️ [AuthContext] Redux store에 접근할 수 없음');
    }
  } catch (error) {
    console.error('❌ [AuthContext] Redux store 디스패치 실패:', error);
  }
};

// 인증 프로바이더 컴포넌트
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    loading: true,
  });

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 메뉴 데이터 복원 함수
  const restoreMenuData = () => {
    try {
      const savedMenus = localStorage.getItem('accessibleMenus');
      if (savedMenus) {
        const parsedMenus = JSON.parse(savedMenus) as Menu[];
        if (Array.isArray(parsedMenus) && parsedMenus.length > 0) {
          console.log(
            '📋 [AuthContext] localStorage에서 메뉴 데이터 복원:',
            parsedMenus.length,
            '개'
          );

          // Redux store의 MenuStore/accessibleMenus에 데이터 설정
          dispatchToStore({
            type: 'MenuStore/accessibleMenus/setData',
            payload: { data: parsedMenus },
          });

          console.log('✅ [AuthContext] 메뉴 데이터 Redux store 복원 완료');
        }
      } else {
        console.log('ℹ️ [AuthContext] localStorage에 메뉴 데이터 없음');
      }
    } catch (error) {
      console.error('❌ [AuthContext] 메뉴 데이터 복원 실패:', error);
      // 잘못된 데이터 제거
      localStorage.removeItem('accessibleMenus');
    }
  };

  // 인증 상태 확인 (localStorage 기반으로 변경)
  const checkAuthStatus = async () => {
    try {
      // localStorage에서 사용자 정보 확인 (sessionStorage에서 변경)
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        console.log('📱 [AuthContext] localStorage에서 사용자 정보 로드:', userData);

        // 사용자 데이터를 User 인터페이스에 맞게 변환
        const user: User = {
          userid: userData.userid,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          roles: userData.role ? [userData.role] : ['USER'], // role이 있으면 배열로 변환
        };

        setAuthState({
          isAuthenticated: true,
          user: user,
          loading: false,
        });

        // 인증 성공 후 메뉴 데이터도 복원
        console.log('🔄 [AuthContext] 인증 확인 후 메뉴 데이터 복원 시작');
        // 약간의 지연을 두고 메뉴 복원 (Redux store 초기화 완료 대기)
        setTimeout(() => {
          restoreMenuData();
        }, 100);
      } else {
        console.log('❌ [AuthContext] localStorage에 사용자 정보 없음');
        setAuthState({
          isAuthenticated: false,
          loading: false,
        });
      }
    } catch (error) {
      console.error('❌ [AuthContext] 인증 상태 확인 오류:', error);
      setAuthState({
        isAuthenticated: false,
        loading: false,
      });
    }
  };

  // LoginPage에서 사용할 인증된 사용자 설정 메서드
  const setAuthenticatedUser = (user: User) => {
    console.log('🔐 [AuthContext] setAuthenticatedUser 호출됨:', user);

    // roles 배열이 없으면 role 기반으로 생성
    const userWithRoles: User = {
      ...user,
      roles: user.roles || (user.role ? [user.role] : ['USER']),
    };

    // localStorage에 사용자 정보 저장
    localStorage.setItem(
      'user',
      JSON.stringify({
        userid: userWithRoles.userid,
        username: userWithRoles.username,
        email: userWithRoles.email,
        role: userWithRoles.role,
      })
    );

    setAuthState({
      isAuthenticated: true,
      user: userWithRoles,
      loading: false,
    });
  };

  // 로그인 함수 (기존 로직 유지 - 테스트용)
  const login = async (email: string, _password: string) => {
    try {
      console.log('🔑 [AuthContext] 직접 로그인 시도:', email);

      // 사용자 데이터 설정
      const userData: User = {
        userid: email,
        username: 'Test User',
        email: email,
        role: 'USER',
        roles: ['USER'],
      };

      // localStorage에 저장
      localStorage.setItem(
        'user',
        JSON.stringify({
          userid: userData.userid,
          username: userData.username,
          email: userData.email,
          role: userData.role,
        })
      );

      setAuthState({
        isAuthenticated: true,
        user: userData,
        loading: false,
      });

      console.log('✅ [AuthContext] 직접 로그인 완료:', userData);
    } catch (error) {
      console.error('❌ [AuthContext] 로그인 오류:', error);
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    console.log('🚪 [AuthContext] 로그아웃 처리');

    // localStorage에서 사용자 정보와 메뉴 정보 모두 제거
    localStorage.removeItem('user');
    localStorage.removeItem('accessibleMenus');
    localStorage.removeItem('commonCodes');

    // Redux store도 초기화
    dispatchToStore({
      type: 'MenuStore/accessibleMenus/reset',
      payload: null,
    });

    setAuthState({
      isAuthenticated: false,
      loading: false,
    });
    console.log('✅ [AuthContext] 로그아웃 완료 - 모든 데이터 정리');
  };

  // 특정 역할 권한 확인
  const hasRole = (role: string): boolean => {
    const result = authState.user?.roles?.includes(role) || false;
    console.log(`🔍 [AuthContext] hasRole(${role}):`, result, 'user roles:', authState.user?.roles);
    return result;
  };

  // 여러 역할 중 하나라도 있는지 확인
  const hasAnyRole = (roles: string[]): boolean => {
    if (!authState.user?.roles) {
      console.log('🔍 [AuthContext] hasAnyRole: 사용자 roles 없음');
      return false;
    }
    const result = roles.some(role => authState.user!.roles!.includes(role));
    console.log(
      `🔍 [AuthContext] hasAnyRole(${roles.join(', ')}):`,
      result,
      'user roles:',
      authState.user.roles
    );
    return result;
  };

  const value: AuthContextType = {
    authState,
    login,
    logout,
    hasRole,
    hasAnyRole,
    setAuthenticatedUser,
    restoreMenuData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 인증 컨텍스트 훅
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
