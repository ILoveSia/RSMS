/**
 * 로그인 페이지 컴포넌트
 * 로그인 성공 시 사용자 정보는 loginStore에, 메뉴 정보는 menuStore에 저장
 * AuthContext와 연동하여 인증 상태 관리
 */
import { apiClient, type ApiError } from '@/app/common/api/client';
import { useRouter } from '@/app/router';
import { useReduxState } from '@/app/store/use-store';
import { Button } from '@/shared/components/ui/button';
import { Alert, Loading, useToastHelpers } from '@/shared/components/ui/feedback';
import { Card } from '@/shared/components/ui/layout';
import { useAuth, type User as AuthUser } from '@/shared/context/AuthContext';
import {
  AccountCircle,
  Business,
  Lock,
  LoginOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  alpha,
  Box,
  Container,
  Divider,
  Fade,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

interface ILoginPageProps {
  userid?: string;
  username?: string;
  password?: string;
}

// Redux 저장용 사용자 정보 인터페이스
interface LoginUser {
  userid: string;
  username: string;
  email: string;
  role?: string;
  accessibleMenus?: Menu[];
}

// API 응답 타입 정의
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

// 로그인 응답 데이터 타입
interface LoginResponseData {
  userId: string;
  username: string;
  email: string;
  authorities: string[];
  sessionId: string;
  loginTime: string;
  sessionExpireTime: string;
  rememberMe: boolean;
  accessibleMenus: Menu[];
}

// 공통코드 타입
interface CommonCode {
  id: number;
  codeGroup: string;
  codeValue: string;
  codeName: string;
  codeNameEn?: string;
  sortOrder?: number;
  isActive: boolean;
  description?: string;
}

// 사용자 옵션 타입
interface UserOption {
  userid: string;
  username: string;
  email?: string;
  deptNm?: string;
  positionNm?: string;
}

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

const LoginPage: React.FC<ILoginPageProps> = (): React.JSX.Element => {
  const theme = useTheme();

  // Redux Store 훅 사용
  const { data: loginData, setData: setLoginData } = useReduxState<LoginUser>('loginStore/login');
  const { data: menuData, setData: setMenuData } = useReduxState<Menu[]>(
    'menuStore/accessibleMenus'
  );
  const { data: allCodes, setData: setAllCodes } =
    useReduxState<CommonCode[]>('codeStore/allCodes');

  // AuthContext 훅 사용
  const { setAuthenticatedUser } = useAuth();

  // 라우터 훅 사용
  const router = useRouter();

  // Toast 알림 훅
  const { showSuccess, showError } = useToastHelpers();

  // 상태 관리
  const [userid, setUserid] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  // 사용자 목록 로드
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        const response = await apiClient.get<any[]>('/admin/users');
        const userOptions: UserOption[] = response
          .filter(user => user.userId && user.userName) // userId와 userName이 있는 사용자만 포함
          .map((user, index) => ({
            userid: user.userId || `user-${index}`,
            username: user.userName || '알 수 없는 사용자',
            email: user.email || '',
            deptNm: user.departmentName || '',
            positionNm: user.positionName || '',
          }));
        console.log('🔍 [Login] 사용자 목록 조회 성공:', userOptions);
        setUsers(userOptions);
        
        // testuser를 기본값으로 설정
        const defaultUser = userOptions.find(user => user.userid === 'testuser');
        if (defaultUser) {
          setSelectedUser(defaultUser);
          console.log('✅ [Login] 기본 사용자 설정:', defaultUser);
        }
      } catch (error) {
        console.error('❌ [Login] 사용자 목록 조회 실패:', error);
        // API 호출 실패 시 하드코딩된 사용자 목록으로 대체
        const fallbackUsers: UserOption[] = [
          { userid: 'testuser', username: '테스트사용자', email: 'test@itcen.com', deptNm: '기획부서', positionNm: '팀장' },
        ];
        setUsers(fallbackUsers);
        const defaultUser = fallbackUsers.find(user => user.userid === 'testuser');
        if (defaultUser) {
          setSelectedUser(defaultUser);
        }
      } finally {
        setUsersLoading(false);
      }
    };
    
    loadUsers();
  }, []);

  // 폼 유효성 검사
  useEffect(() => {
    setIsFormValid(userid.trim().length > 0 && password.trim().length > 0);
  }, [userid, password]);

  // 선택된 사용자 변경 시 userid 업데이트
  useEffect(() => {
    if (selectedUser?.userid && !selectedUser.userid.startsWith('user-')) {
      setUserid(selectedUser.userid);
    } else {
      setUserid('');
    }
  }, [selectedUser]);

  // 로그인 데이터 변경 시 console에 출력
  useEffect(() => {
  }, [loginData]);

  // 메뉴 데이터 변경 시 console에 출력
  useEffect(() => {
  }, [menuData]);

  // 공통코드 데이터 변경 시 console에 출력
  useEffect(() => {
  }, [allCodes]);

  // 공통코드 조회 함수
  const loadCommonCodes = async () => {
    try {

      const allCodesResult = await apiClient.get<ApiResponse<CommonCode[]> | CommonCode[]>(
        '/common-codes'
      );

      // ApiResponse 래퍼 구조인지 확인하여 적절히 처리
      let commonCodesData: CommonCode[];
      if (
        allCodesResult &&
        typeof allCodesResult === 'object' &&
        'data' in allCodesResult &&
        'success' in allCodesResult
      ) {
        const apiResponse = allCodesResult as ApiResponse<CommonCode[]>;
        if (apiResponse.success && apiResponse.data) {
          commonCodesData = apiResponse.data;
        } else {
          throw new Error(apiResponse.message || '공통코드 조회에 실패했습니다.');
        }
      } else {
        commonCodesData = allCodesResult as CommonCode[];
      }

      setAllCodes(commonCodesData);
      localStorage.setItem('commonCodes', JSON.stringify(commonCodesData));
    } catch (error) {
      console.error('❌ [공통코드] 공통코드 조회 실패:', error);
    }
  };

  // 메뉴 조회 함수 (새로운 권한 API 사용)
  const loadAccessibleMenus = async (userId: string, userRole?: string) => {
    try {
      console.log('🔍 [메뉴] 사용자별 메뉴 권한 조회 시작:', userId);
      
      // 전달받은 사용자 역할 또는 기본값 사용
      const role = userRole || 'USER'; // 기본값 USER
      const apiUrl = `/menus/accessible?role=${role}`;
      
      console.log('🔍 [메뉴] 사용자 역할 기반 API 사용:', apiUrl, '(userId:', userId, ', role:', role, ')');
      const menuResult = await apiClient.get<unknown>(apiUrl);
      console.log('📋 [메뉴] API 응답:', menuResult);
      console.log('📋 [메뉴] API 응답 타입:', typeof menuResult, ', 배열 여부:', Array.isArray(menuResult), ', 길이:', Array.isArray(menuResult) ? menuResult.length : 'N/A');
      
      if (Array.isArray(menuResult) && menuResult.length > 0) {
        const convertedMenus = menuResult.map((menu: Menu) => ({
          id: Number(menu.id),
          menuCode: menu.menuCode,
          menuName: menu.menuName,
          menuNameEn: menu.menuNameEn,
          parentId: menu.parentId ? Number(menu.parentId) : undefined,
          menuLevel: menu.menuLevel,
          sortOrder: menu.sortOrder,
          menuUrl: menu.menuUrl,
          iconClass: menu.iconClass,
          isActive: menu.isActive === true,
          isVisible: menu.isVisible === true,
          description: menu.description,
          children: [],
          canRead: menu.canRead === true, // 실제 권한값 사용
          canWrite: menu.canWrite === true,
          canDelete: menu.canDelete === true,
        }));

        console.log('✅ [메뉴] 변환된 메뉴 데이터:', convertedMenus.length, '개');
        console.log('📊 [메뉴] 메뉴 상세 데이터:', convertedMenus);
        
        // Redux store에 메뉴 데이터 설정
        setMenuData(convertedMenus);
        console.log('💾 [메뉴] Redux store 저장 완료 - setMenuData 호출됨');
        
        // localStorage에도 저장 (새로고침 시 복원용)
        localStorage.setItem('accessibleMenus', JSON.stringify(convertedMenus));
        console.log('💾 [메뉴] localStorage 저장 완료');

      } else {
        console.log('⚠️ [메뉴] 접근 가능한 메뉴가 없습니다.');
        setMenuData([]);
      }
    } catch (error) {
      console.error('❌ [메뉴] 메뉴 조회 실패:', error);
      setMenuData([]);
    }
  };

  // 로그인 API 호출
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setError('모든 필드를 올바르게 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    const loginRequestData = {
      userid: userid,
      username: userid,
      password: password,
    };

    try {

      const response = await apiClient.post<ApiResponse<LoginResponseData> | LoginResponseData>(
        '/auth/login',
        loginRequestData
      );

      // ApiResponse 래퍼 구조인지 확인하여 적절히 처리
      let userData: LoginResponseData;
      if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
        const apiResponse = response as ApiResponse<LoginResponseData>;
        if (apiResponse.success && apiResponse.data) {
          userData = apiResponse.data;
        } else {
          throw new Error(apiResponse.message || '로그인에 실패했습니다.');
        }
      } else {
        userData = response as LoginResponseData;
      }

      const userForStore: LoginUser = {
        userid: userData.userId, // 필드명 매핑: userId → userid
        username: userData.username,
        email: userData.email,
        role: userData.authorities?.[0]?.replace('ROLE_', '') || 'USER', // authorities에서 role 추출
        accessibleMenus: userData.accessibleMenus || [],
      };

      setLoginData(userForStore);

      const userForAuth: AuthUser = {
        userid: userForStore.userid,
        username: userForStore.username,
        email: userForStore.email,
        role: userForStore.role,
        roles: userData.authorities?.map(auth => auth.replace('ROLE_', '')) || ['USER'],
      };

      setAuthenticatedUser(userForAuth);

      console.log('📊 [로그인] 공통코드 및 메뉴 데이터 로딩 시작');
      console.log('🔍 [로그인] 사용자 권한 정보:', {
        authorities: userData.authorities,
        firstAuthority: userData.authorities?.[0],
        extractedRole: userData.authorities?.[0]?.replace('ROLE_', ''),
        userId: userData.userId
      });
      
      // 공통코드 및 메뉴 조회 (사용자 역할 정보 전달)
      const userRole = userData.authorities?.[0]?.replace('ROLE_', '') || 'USER';
      console.log('🎯 [로그인] 최종 사용할 역할:', userRole);
      await Promise.all([loadCommonCodes(), loadAccessibleMenus(userData.userId, userRole)]);

      console.log('✅ [로그인] 모든 데이터 로딩 완료');
      showSuccess('로그인이 성공했습니다!');

      // 충분한 시간을 두고 페이지 이동 (메뉴 데이터 반영 대기)
      setTimeout(() => {
        console.log('🚀 [로그인] 메인 페이지로 이동');
        router.push('/main');
      }, 1500);
    } catch (error) {
      console.error('❌ [API] 로그인 API 호출 실패:', error);

      let errorMessage = '로그인에 실패했습니다.';

      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as ApiError;
        if (apiError.status === 400) {
          errorMessage = '잘못된 요청입니다. 사용자 ID를 확인해주세요.';
        } else if (apiError.status === 401) {
          errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다.';
        } else if (apiError.status === 404) {
          errorMessage = '사용자를 찾을 수 없습니다.';
        } else if (apiError.status === 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else {
          errorMessage = apiError.message || errorMessage;
        }
      }

      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
          theme.palette.secondary.main,
          0.1
        )} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container
        component='main'
        maxWidth='sm'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Fade in timeout={800}>
          <Card
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              width: '100%',
              maxWidth: 480,
              backdropFilter: 'blur(10px)',
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
            }}
          >
            {/* 헤더 섹션 */}
            <Box textAlign='center' mb={4}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  mb: 2,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                }}
              >
                <Business sx={{ fontSize: 32, color: 'var(--bank-text-primary)' }} />
              </Box>

              <Typography variant='h4' component='h1' fontWeight='bold' color='text.primary' mb={1}>
                ITCEN Solution
              </Typography>

              <Box 
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.5,
                  mb: 2,
                  borderRadius: 20,
                  background: alpha(theme.palette.warning.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                }}
              >
                <Typography 
                  variant='caption' 
                  sx={{ 
                    color: theme.palette.warning.dark,
                    fontWeight: 'bold',
                    letterSpacing: 0.5,
                  }}
                >
                  PROTOTYPE
                </Typography>
                <Typography 
                  variant='caption' 
                  sx={{ 
                    color: theme.palette.warning.dark,
                    fontSize: '0.7rem',
                  }}
                >
                  v0.1.0
                </Typography>
              </Box>

              <Typography variant='body1' color='text.secondary' sx={{ opacity: 0.8 }}>
                책무구조도 관리 시스템에 로그인하세요
              </Typography>
            </Box>

            {/* 로그인 폼 */}
            <Box component='form' onSubmit={handleLogin} noValidate>
              <Stack spacing={3}>
                <Autocomplete
                  fullWidth
                  id='userid'
                  options={users}
                  getOptionLabel={(option) => {
                    const username = option.username || '알 수 없음';
                    const userid = option.userid || 'N/A';
                    return `${username} (${userid})`;
                  }}
                  renderOption={(props, option, { index }) => {
                    const { key, ...otherProps } = props;
                    const safeKey = option.userid || `option-${index}`;
                    return (
                      <Box component="li" key={safeKey} {...otherProps}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" component="div">
                            {option.username || '알 수 없는 사용자'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {option.userid || 'N/A'} {option.deptNm && `• ${option.deptNm}`} {option.positionNm && `• ${option.positionNm}`}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }}
                  value={selectedUser}
                  onChange={(_, newValue) => {
                    setSelectedUser(newValue);
                  }}
                  loading={usersLoading}
                  noOptionsText="사용자를 찾을 수 없습니다"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="사용자 선택"
                      variant="outlined"
                      required
                      autoFocus
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <React.Fragment>
                            {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                          },
                          '&.Mui-focused': {
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                          },
                        },
                      }}
                    />
                  )}
                />

                <TextField
                  fullWidth
                  id='password'
                  name='password'
                  label='비밀번호'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete='current-password'
                  required
                  variant='outlined'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Lock sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          aria-label='toggle password visibility'
                          onClick={handleTogglePasswordVisibility}
                          edge='end'
                          size='small'
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                      },
                    },
                  }}
                />

                {error && (
                  <Alert severity='error' sx={{ borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                {loginData && !error && (
                  <Alert severity='success' sx={{ borderRadius: 2 }}>
                    <Typography variant='body2' fontWeight='medium'>
                      로그인 성공! 메인 페이지로 이동합니다...
                    </Typography>
                  </Alert>
                )}

                <Button
                  type='submit'
                  fullWidth
                  variant='contained'
                  size='large'
                  disabled={!isFormValid || loading}
                  startIcon={loading ? <Loading size={20} /> : <LoginOutlined />}
                  disableRipple
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      boxShadow: `0 3px 12px ${alpha(theme.palette.primary.main, 0.5)}`,
                      transform: 'none',
                    },
                    '&:disabled': {
                      background: 'var(--bank-primary-bg)',
                      color: 'var(--bank-text-primary)',
                      boxShadow: 'none',
                      transform: 'none',
                    },
                  }}
                >
                  {loading ? '로그인 중...' : '로그인'}
                </Button>
              </Stack>
            </Box>

            {/* 개발용 정보 (개발 환경에서만 표시) */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.grey[500], 0.1),
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                  }}
                >
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    fontWeight='medium'
                    display='block'
                    mb={1}
                  >
                    🔧 기술스택 정보
                  </Typography>

                  <Stack spacing={0.5}>
                    <Typography variant='caption' color='text.secondary'>
                      React 18.2, TypeScript 5.8.3  ✅
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                     Spring Boot 3.5, PostgreSQL 17, Redis 7.4  ✅
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Material-UI v5 기반 모던 디자인 시스템 ✅
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Vite 5.0.12, Hot Reload, 자동화된 설정 ✅
                    </Typography>
                  </Stack>
                </Box>
              </>
            )}

            {/* 프로토타입 안내 푸터 */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                textAlign: 'center',
              }}
            >
              <Typography 
                variant='body2' 
                color='text.secondary'
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
              >
                <Typography component='span' sx={{ fontSize: '1.2em' }}>⚠️</Typography>
                이 시스템은 현재
                <Typography 
                  component='span' 
                  sx={{ 
                    color: theme.palette.info.main,
                    fontWeight: 'bold',
                    mx: 0.5,
                  }}
                >
                  프로토타입 단계
                </Typography>
                입니다.
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: 'block' }}>
                실제 운영 환경에서는 사용하지 마세요.
              </Typography>
            </Box>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default LoginPage;
