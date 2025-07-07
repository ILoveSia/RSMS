/**
 * 로그인 페이지 컴포넌트
 * 로그인 성공 시 사용자 정보는 loginStore에, 메뉴 정보는 menuStore에 저장
 * AuthContext와 연동하여 인증 상태 관리
 */
import { apiClient, type ApiError } from '@/app/common/api/client';
import { useRouter } from '@/app/router';
import { useReduxState } from '@/app/store/use-store';
import { useAuth } from '@/shared/context/AuthContext';
import { Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface ILoginPageProps {
  userid?: string;
  username?: string;
  password?: string;
}

interface User {
  userid: string;
  username: string;
  email: string;
  role?: string;
  accessibleMenus?: Menu[];
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
  // Redux Store 훅 사용
  const { data: loginData, setData: setLoginData } = useReduxState<User>('loginStore/login');
  const { data: menuData, setData: setMenuData } = useReduxState<Menu[]>(
    'menuStore/accessibleMenus'
  );

  // 공통코드 Store 훅 사용
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allCodes, setData: setAllCodes } = useReduxState<any[]>('codeStore/allCodes');

  // AuthContext 훅 사용
  const { setAuthenticatedUser } = useAuth();

  // 라우터 훅 사용
  const router = useRouter();

  const [userid, setUserid] = useState('testuser'); // 실제 username 또는 email
  const [password, setPassword] = useState('testpass123'); // 테스트용 기본값
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로그인 데이터 변경 시 console에 출력
  useEffect(() => {
    console.log('🔄 [Redux Store] loginData 변경:', loginData);
  }, [loginData]);

  // 메뉴 데이터 변경 시 console에 출력
  useEffect(() => {
    console.log('🔄 [Redux Store] menuData 변경:', menuData);
  }, [menuData]);

  // 공통코드 데이터 변경 시 console에 출력
  useEffect(() => {
    console.log('🔄 [Redux Store] allCodes 변경:', allCodes);
  }, [allCodes]);

  // 공통코드 조회 함수
  const loadCommonCodes = async () => {
    try {
      console.log('🔍 [공통코드] 공통코드 조회 시작');

      // 모든 공통코드 조회
      const allCodesResult = await apiClient.get<unknown>('/api/common-codes');
      console.log('✅ [공통코드] 모든 공통코드 조회 성공:', allCodesResult);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const commonCodesData = (allCodesResult as any).data || allCodesResult;
      setAllCodes(commonCodesData);

      // localStorage에도 공통코드 데이터 저장
      localStorage.setItem('commonCodes', JSON.stringify(commonCodesData));
      console.log('✅ [localStorage] 공통코드 데이터 저장 완료');

      console.log('✅ [공통코드] 공통코드 조회 완료');
    } catch (error) {
      console.error('❌ [공통코드] 공통코드 조회 실패:', error);
      // 에러가 발생해도 로그인은 계속 진행되도록 함
    }
  };

  // 메뉴 조회 함수
  const loadAccessibleMenus = async () => {
    try {
      console.log('🔍 [메뉴] 접근 가능한 메뉴 조회 시작');

      // 사용자 역할에 따른 접근 가능한 메뉴 조회
      const menuResult = await apiClient.get<unknown>('/menus/accessible?role=USER');
      console.log('✅ [메뉴] 접근 가능한 메뉴 조회 성공:', menuResult);

      if (Array.isArray(menuResult) && menuResult.length > 0) {
        // 백엔드 MenuDto를 프론트엔드 Menu 타입으로 변환
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const convertedMenus = menuResult.map((menu: any) => ({
          id: Number(menu.id), // Long to number 변환
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
          canRead: menu.canRead,
          canWrite: menu.canWrite,
          canDelete: menu.canDelete,
        }));

        setMenuData(convertedMenus);

        // localStorage에도 메뉴 데이터 저장
        localStorage.setItem('accessibleMenus', JSON.stringify(convertedMenus));

        console.log('✅ [Redux Store] 메뉴 데이터 저장 완료 - 메뉴 개수:', convertedMenus.length);
        console.log('✅ [localStorage] 메뉴 데이터 저장 완료');
        console.log(
          '🔍 [Redux Store] 변환된 메뉴 목록:',
          convertedMenus.map(menu => ({
            id: menu.id,
            menuName: menu.menuName,
            menuLevel: menu.menuLevel,
            parentId: menu.parentId,
            menuUrl: menu.menuUrl,
          }))
        );
        console.log(
          '🔍 [Redux Store] setMenuData 호출 완료, actionType: menuStore/accessibleMenus'
        );

        // 저장 후 즉시 확인
        setTimeout(() => {
          console.log('🔍 [Redux Store] 저장 후 menuData 확인:', menuData);
        }, 100);
      } else {
        console.log('⚠️ [메뉴] 접근 가능한 메뉴가 없습니다.');
        setMenuData([]);
      }

      console.log('✅ [메뉴] 메뉴 조회 완료');
    } catch (error) {
      console.error('❌ [메뉴] 메뉴 조회 실패:', error);
      setMenuData([]);
    }
  };

  // 로그인 API 호출
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔍 [DEBUG] handleLogin 호출됨');
    console.log('🔍 [DEBUG] 현재 userid:', `'${userid}'`);
    console.log('🔍 [DEBUG] 현재 password:', `'${password}'`);

    if (!userid.trim()) {
      setError('아이디를 입력해주세요.');
      return;
    }

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    // 백엔드 로그인 API 호출
    const loginRequestData = {
      userid: userid,
      username: userid, // userid와 동일한 값으로 설정
      password: password,
      rememberMe: false,
    };

    // 디버깅용 로그 추가
    console.log('🔍 [DEBUG] 로그인 데이터:', loginRequestData);
    console.log('🔍 [DEBUG] userid 길이:', userid.length);
    console.log('🔍 [DEBUG] password 길이:', password.length);

    try {
      const result = await apiClient.post<User>('auth/login', loginRequestData);

      console.log('✅ [API] 로그인 성공');
      console.log('📡 [API 응답 전체]:', result);
      console.log('🔍 [API 응답] 사용자 정보:', {
        userid: result.userid,
        username: result.username,
        email: result.email,
        role: result.role,
      });
      console.log('🔍 [API 응답] 메뉴 데이터:', {
        hasAccessibleMenus: !!result.accessibleMenus,
        menuCount: result.accessibleMenus?.length || 0,
        menus: result.accessibleMenus,
      });

      // Redux Store에 사용자 데이터 저장
      setLoginData(result);
      // Session Storage에 userid, username, email만 저장
      sessionStorage.setItem(
        'user',
        JSON.stringify({
          userid: result.userid,
          username: result.username,
          email: result.email,
          role: result.role,
        })
      );
      console.log('✅ [Redux Store] 사용자 데이터 저장 완료');
      console.log('✅ [Session Storage] user 저장:', sessionStorage.getItem('user'));
      console.log('setLoginData 호출 후 loginData:', loginData);

      // AuthContext 인증 상태 업데이트
      const userForAuth = {
        userid: result.userid,
        username: result.username,
        email: result.email,
        role: result.role,
        roles: result.role ? [result.role] : ['USER'],
        accessibleMenus: result.accessibleMenus || [],
      };

      console.log('🔄 [LoginPage] setAuthenticatedUser 호출 전:', userForAuth);
      setAuthenticatedUser(userForAuth);
      console.log('✅ [LoginPage] setAuthenticatedUser 호출 완료 - 사용자 역할:', userForAuth.roles);

      // 로그인 성공 시 공통코드 및 메뉴 조회
      await Promise.all([loadCommonCodes(), loadAccessibleMenus()]);

      setLoading(false);

      // 성공 시 MainPage로 이동
      setTimeout(() => {
        console.log('🔄 MainPage로 이동합니다.');
        router.push('/main');
      }, 1000); // 1초 후 이동 (사용자가 결과를 볼 수 있도록)
    } catch (error) {
      console.error('❌ [API] 로그인 API 호출 실패:', error);

      // 에러 상세 정보 확인
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
      setLoading(false);
    }
  };

  // 개발용: Redux Store 데이터 직접 확인 함수
  const checkStoreData = () => {
    const storeInfo = {
      loginData: loginData,
      menuData: menuData,
      menuCount: menuData ? menuData.length : 0,
    };
    alert(`Redux Store 데이터:\n${JSON.stringify(storeInfo, null, 2)}`);
  };

  return (
    <Box
      display='flex'
      justifyContent='center'
      alignItems='center'
      minHeight='100vh'
      bgcolor='#f5f5f5'
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: 400, maxWidth: '90vw', margin: 'auto' }}>
        <Typography variant='h5' component='h1' gutterBottom align='center'>
          로그인
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label='아이디'
            variant='outlined'
            fullWidth
            margin='normal'
            value={userid}
            onChange={e => setUserid(e.target.value)}
            autoComplete='userid'
            required
            placeholder='사용자 ID를 입력하세요'
          />
          <TextField
            label='비밀번호'
            type='password'
            variant='outlined'
            fullWidth
            margin='normal'
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete='current-password'
            required
            placeholder='비밀번호를 입력하세요'
          />
          {error && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography
                color='error.dark'
                variant='body2'
                align='center'
                sx={{ fontWeight: 'bold' }}
              >
                ❌ 로그인 실패
              </Typography>
              <Typography color='error.dark' variant='body2' align='center' sx={{ mt: 1 }}>
                {error}
              </Typography>
            </Box>
          )}
          {loginData && !error && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography
                variant='body2'
                color='success.dark'
                align='center'
                sx={{ fontWeight: 'bold' }}
              >
                ✅ 로그인 성공!
              </Typography>
              <Typography variant='caption' display='block' align='center' sx={{ mt: 1 }}>
                사용자명: {loginData.userid}
              </Typography>
              <Typography variant='caption' display='block' align='center'>
                이메일: {loginData.email}
              </Typography>
              {menuData && (
                <Typography variant='caption' display='block' align='center' sx={{ mt: 1 }}>
                  메뉴 개수: {menuData.length}개
                </Typography>
              )}
              {allCodes && (
                <Typography variant='caption' display='block' align='center' sx={{ mt: 1 }}>
                  공통코드: {Array.isArray(allCodes) ? allCodes.length : 'N/A'}개
                </Typography>
              )}
              <Typography
                variant='caption'
                display='block'
                align='center'
                sx={{ mt: 1, fontStyle: 'italic' }}
              >
                (Redux Store로 관리됨)
              </Typography>
            </Box>
          )}
          <Box mt={3} display='flex' justifyContent='center'>
            <Button
              type='submit'
              variant='contained'
              color='primary'
              fullWidth
              disabled={loading || !userid.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{ py: 1.5 }}
            >
              {loading ? '로그인 처리 중...' : '로그인'}
            </Button>
          </Box>
        </form>

        {/* 개발용 정보 표시 */}
        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1, fontSize: '0.75rem' }}>
          <Typography variant='caption' display='block'>
            Redux Store: loginStore/login, menuStore/accessibleMenus, codeStore/usableGroupedCodes
          </Typography>
          <Typography variant='caption' display='block'>
            로그인 데이터: {loginData ? `${loginData.userid} (${loginData.email})` : '없음'}
          </Typography>
          <Typography variant='caption' display='block'>
            메뉴 데이터: {menuData ? `${menuData.length}개 메뉴` : '없음'}
          </Typography>
          <Typography variant='caption' display='block'>
            공통코드 데이터:{' '}
            {allCodes ? `${Array.isArray(allCodes) ? allCodes.length : 'N/A'}개` : '없음'}
          </Typography>
          <Typography variant='caption' display='block'>
            현재 상태: {loading ? '로딩 중' : error ? '에러' : loginData ? '성공' : '대기'}
          </Typography>
          {error && (
            <Typography variant='caption' display='block' color='error.main'>
              에러 메시지: {error}
            </Typography>
          )}
          <Button
            size='small'
            variant='outlined'
            onClick={checkStoreData}
            sx={{ mt: 1, fontSize: '0.7rem' }}
          >
            Redux Store 데이터 확인
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
