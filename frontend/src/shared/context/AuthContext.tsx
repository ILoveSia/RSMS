import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';

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
}

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 인증 프로바이더 Props
interface AuthProviderProps {
  children: ReactNode;
}

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

  // 인증 상태 확인 (sessionStorage 기반으로 변경)
  const checkAuthStatus = async () => {
    try {
      // sessionStorage에서 사용자 정보 확인
      const userDataStr = sessionStorage.getItem('user');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        console.log('📱 [AuthContext] sessionStorage에서 사용자 정보 로드:', userData);

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

        console.log('✅ [AuthContext] 인증 상태 설정 완료:', user);
      } else {
        console.log('❌ [AuthContext] sessionStorage에 사용자 정보 없음');
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

    setAuthState({
      isAuthenticated: true,
      user: userWithRoles,
      loading: false,
    });

    console.log('✅ [AuthContext] 인증 상태 업데이트 완료:', userWithRoles);
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

      // sessionStorage에 저장
      sessionStorage.setItem('user', JSON.stringify({
        userid: userData.userid,
        username: userData.username,
        email: userData.email,
        role: userData.role,
      }));

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
    sessionStorage.removeItem('user');
    setAuthState({
      isAuthenticated: false,
      loading: false,
    });
    console.log('✅ [AuthContext] 로그아웃 완료');
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
    console.log(`🔍 [AuthContext] hasAnyRole(${roles.join(', ')}):`, result, 'user roles:', authState.user.roles);
    return result;
  };

  const value: AuthContextType = {
    authState,
    login,
    logout,
    hasRole,
    hasAnyRole,
    setAuthenticatedUser,
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
