# 🎨 Frontend 아키텍처 가이드 (초보자용)

## 📋 목차
- [🎯 개요](#-개요)
- [🛠 기술 스택](#-기술-스택)
- [📁 프로젝트 구조](#-프로젝트-구조)
- [🏗 아키텍처 패턴](#-아키텍처-패턴)
- [🧩 핵심 개념](#-핵심-개념)
- [🔄 데이터 흐름](#-데이터-흐름)
- [📝 개발 가이드](#-개발-가이드)
- [🔍 파일별 상세 설명](#-파일별-상세-설명)

---

## 🎯 개요

ITCEN Solution Frontend는 **React 18.2**와 **TypeScript 5.8**을 기반으로 한 현대적인 Single Page Application(SPA)입니다. 금융기관의 내부통제 시스템을 위한 관리자 대시보드 형태로 구성되어 있습니다.

### 🎨 주요 특징
- **타입 안전성**: TypeScript로 컴파일 타임 에러 방지
- **컴포넌트 기반**: 재사용 가능한 UI 컴포넌트 시스템
- **도메인 기반 구조**: 비즈니스 로직별 모듈 분리
- **상태 관리**: Redux Toolkit 기반 중앙 상태 관리
- **모던 UI**: Material-UI v5 디자인 시스템

---

## 🛠 기술 스택

### 📦 Core Technologies
```json
{
  "runtime": "React 18.2.0",
  "language": "TypeScript 5.8.3", 
  "bundler": "Vite 5.0.12",
  "ui_library": "Material-UI v5.15.20",
  "state_management": "Redux Toolkit 2.8.2",
  "routing": "React Router v6.26.0"
}
```

### 🔧 Development Tools
- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포맷팅 (설정 예상)
- **Vite**: 빠른 개발 서버 및 빌드
- **TypeScript**: 정적 타입 검사

### 📚 Additional Libraries
- **Axios**: HTTP 클라이언트
- **Day.js**: 날짜 처리
- **ExcelJS**: Excel 파일 처리
- **UUID**: 고유 ID 생성

---

## 📁 프로젝트 구조

```
frontend/
├── public/                          # 정적 파일
├── src/
│   ├── App.tsx                     # 🔑 루트 컴포넌트
│   ├── main.tsx                    # 🚀 애플리케이션 진입점
│   ├── app/                        # 🏗 앱 레벨 설정
│   │   ├── components/             # 앱 공통 컴포넌트
│   │   ├── router/                 # 🛣 라우팅 시스템
│   │   ├── store/                  # 🗄 Redux 스토어 설정
│   │   ├── theme/                  # 🎨 Material-UI 테마
│   │   └── types/                  # 🏷 글로벌 타입 정의
│   ├── domains/                    # 🏢 비즈니스 도메인별 모듈
│   │   ├── main/                   # 메인 대시보드
│   │   ├── login/                  # 로그인 & 인증
│   │   ├── ledgermngt/            # 원장 관리
│   │   ├── inquiry/               # 조회 및 현황
│   │   ├── meeting/               # 회의 관리
│   │   └── common/                # 공통 도메인
│   └── shared/                     # 🔗 공유 리소스
│       ├── components/             # 재사용 가능 컴포넌트
│       ├── hooks/                  # 커스텀 React 훅
│       ├── context/               # React Context
│       ├── store/                 # 공통 스토어
│       └── utils/                 # 유틸리티 함수
├── package.json                    # 의존성 정의
└── vite.config.js                 # Vite 설정
```

### 📂 구조 설명

#### 🏗 `/app` - 애플리케이션 설정
- **router/**: 라우팅 설정 및 도메인별 라우트 관리
- **store/**: Redux 스토어 설정 및 글로벌 상태 관리
- **theme/**: Material-UI 테마 및 스타일 설정
- **types/**: 전역에서 사용되는 TypeScript 타입

#### 🏢 `/domains` - 비즈니스 도메인
각 도메인은 독립적인 모듈로 구성:
```
domain/
├── api/                    # API 클라이언트
├── components/             # 도메인 전용 컴포넌트
├── pages/                  # 페이지 컴포넌트
├── hooks/                  # 도메인 전용 훅
├── store/                  # 도메인 상태 관리
└── router/                 # 도메인 라우팅
```

#### 🔗 `/shared` - 공유 리소스
- **components/ui/**: 재사용 가능한 UI 컴포넌트 라이브러리
- **hooks/**: 여러 도메인에서 사용하는 공통 훅
- **context/**: React Context (인증, 테마 등)
- **utils/**: 유틸리티 함수

---

## 🏗 아키텍처 패턴

### 1. 📐 Domain-Driven Design (DDD)
비즈니스 로직에 따라 도메인별로 모듈을 분리:

```typescript
// 도메인별 독립적인 구조
domains/
├── ledgermngt/     # 원장 관리 도메인
├── inquiry/        # 조회 도메인  
├── meeting/        # 회의 도메인
└── login/          # 인증 도메인
```

### 2. 🧩 Component-Based Architecture
재사용 가능한 컴포넌트 기반 개발:

```typescript
// 컴포넌트 계층구조
App
├── Layout (공통 레이아웃)
├── Router (라우팅)
└── Pages (페이지별 컴포넌트)
    ├── Domain Components (도메인 컴포넌트)
    └── Shared Components (공통 컴포넌트)
```

### 3. 🔄 Unidirectional Data Flow
단방향 데이터 흐름으로 상태 관리:

```
UI Event → Action → Reducer → Store → UI Update
```

---

## 🧩 핵심 개념

### 1. 🔑 엔트리 포인트 (main.tsx)

```typescript
// main.tsx - 애플리케이션 시작점
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';

// Redux Store 초기화
const store = configureAppStore(reducers);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>           {/* Redux 스토어 제공 */}
      <ThemeProvider theme={theme}>    {/* Material-UI 테마 */}
        <CssBaseline />               {/* CSS 기본값 리셋 */}
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
```

### 2. 🔗 루트 컴포넌트 (App.tsx)

```typescript
// App.tsx - 메인 컴포넌트
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoadingProvider>          {/* 전역 로딩 상태 관리 */}
        <ToastProvider>          {/* 알림 메시지 관리 */}
          <AuthProvider>         {/* 인증 상태 관리 */}
            <BrowserRouter>
              <AppRoutes />      {/* 라우팅 시스템 */}
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}
```

### 3. 🛣 라우팅 시스템

#### 도메인별 라우트 등록
```typescript
// app/router/routes.tsx
const routeManager = new RouteManager();

// 각 도메인의 라우트를 등록
routeManager.registerDomainRoutes('login', loginRoutes);
routeManager.registerDomainRoutes('main', mainRoutes);
routeManager.registerDomainRoutes('ledgermngt', ledgermngtRoutes);
routeManager.registerDomainRoutes('inquiry', inquiryRoutes);
```

#### RouteGuard로 인증 처리
```typescript
// 각 라우트에 보안 가드 적용
return {
  path: route.path,
  element: appRoute?.meta ? (
    <RouteGuard meta={appRoute.meta}>
      <React.Suspense fallback={<div>Loading...</div>}>
        {route.element}
      </React.Suspense>
    </RouteGuard>
  ) : (
    <React.Suspense fallback={<div>Loading...</div>}>
      {route.element}
    </React.Suspense>
  ),
};
```

### 4. 🗄 상태 관리 (Redux Toolkit)

#### 글로벌 스토어 설정
```typescript
// app/store/index.ts
export const useAPI = <T = unknown>(actionType: string) => {
  const dispatch = useDispatch();
  
  // Redux state에서 데이터 가져오기
  const data = useSelector((rootState: unknown) => {
    // actionType을 경로로 사용하여 데이터 접근
    // 예: 'positions/list' → rootState.positions.list
  });

  // API 호출 함수
  const fetch = async (params: FetchParams = {}): Promise<T> => {
    // 1. 로딩 상태 시작
    // 2. API 호출 (Axios)
    // 3. 성공 시 Redux에 데이터 저장
    // 4. 실패 시 에러 상태 저장
    // 5. 로딩 상태 종료
  };

  return { data, fetch, setData };
};
```

#### 사용 예시
```typescript
// 컴포넌트에서 API 사용
const PositionList = () => {
  const { data: positions, fetch: fetchPositions } = useAPI<Position[]>('positions/list');
  
  useEffect(() => {
    fetchPositions(); // 컴포넌트 마운트 시 데이터 로드
  }, []);

  return (
    <div>
      {positions?.map(position => (
        <div key={position.id}>{position.name}</div>
      ))}
    </div>
  );
};
```

---

## 🔄 데이터 흐름

### 1. 📡 API 통신 흐름

```
[컴포넌트] 
    ↓ useAPI 호출
[useAPI Hook]
    ↓ dispatch 액션
[Redux Store]
    ↓ 상태 업데이트
[컴포넌트 리렌더링]
```

### 2. 🔍 상세 데이터 흐름

```typescript
// 1. 컴포넌트에서 API 호출
const { data, fetch } = useAPI('positions/list');
await fetch();

// 2. useAPI 내부에서 처리
const response = await apiClient.get('/api/positions');

// 3. Redux 액션 디스패치
dispatch({
  type: 'positions/list/setData',
  payload: response.data
});

// 4. 컴포넌트 자동 리렌더링 (useSelector로 연결됨)
```

### 3. 🎯 이벤트 처리 흐름

```typescript
// 사용자 이벤트 → API 호출 → 상태 업데이트 → UI 갱신
const handleSubmit = async (formData) => {
  try {
    await createPosition(formData);  // API 호출
    await fetchPositions();          // 목록 새로고침
    showToast('생성 완료');          // 사용자 피드백
  } catch (error) {
    showToast('생성 실패');
  }
};
```

---

## 📝 개발 가이드

### 1. 🆕 새로운 페이지 추가하기

#### Step 1: 도메인 선택/생성
```bash
# 기존 도메인 사용 또는 새 도메인 생성
src/domains/[domain-name]/
```

#### Step 2: 페이지 컴포넌트 생성
```typescript
// src/domains/example/pages/ExamplePage.tsx
import React from 'react';
import { PageContainer, PageHeader } from '@/shared/components/ui/layout';

const ExamplePage: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader title="예시 페이지" />
      {/* 페이지 내용 */}
    </PageContainer>
  );
};

export default ExamplePage;
```

#### Step 3: 라우트 등록
```typescript
// src/domains/example/router/index.ts
import { lazy } from 'react';

const ExamplePage = lazy(() => import('../pages/ExamplePage'));

export default [
  {
    path: '/example',
    element: <ExamplePage />,
    meta: { title: '예시 페이지', requiresAuth: true }
  }
];
```

#### Step 4: 메인 라우터에 등록
```typescript
// src/app/router/routes.tsx
import exampleRoutes from '@/domains/example/router';

routeManager.registerDomainRoutes('example', exampleRoutes);
```

### 2. 🔗 API 연동하기

#### Step 1: API 액션 등록
```typescript
// src/domains/example/store/index.ts
import { registerActions } from '@/app/store';

const actions = {
  getExampleList: { actionType: 'example/list', url: '/api/examples' },
  createExample: { actionType: 'example/create', url: '/api/examples' }
};

registerActions(actions);
```

#### Step 2: 컴포넌트에서 사용
```typescript
import { useAPI } from '@/app/store';

const ExampleComponent = () => {
  const { data: examples, fetch: fetchExamples } = useAPI('example/list');
  
  const loadData = async () => {
    try {
      await fetchExamples();
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      {examples?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

### 3. 🎨 공통 컴포넌트 사용하기

#### UI 컴포넌트 활용
```typescript
import { 
  Button, 
  DataGrid, 
  Modal, 
  Toast,
  PageContainer 
} from '@/shared/components/ui';

// 버튼 사용
<Button variant="primary" onClick={handleClick}>
  클릭하세요
</Button>

// 데이터 그리드 사용
<DataGrid
  columns={columns}
  data={data}
  onRowClick={handleRowClick}
/>

// 모달 사용
<Modal open={isOpen} onClose={handleClose} title="제목">
  <p>모달 내용</p>
</Modal>
```

### 4. 📱 반응형 디자인

#### Material-UI 브레이크포인트 사용
```typescript
import { useTheme, useMediaQuery } from '@mui/material';

const Component = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
};
```

---

## 🔍 파일별 상세 설명

### 📝 설정 파일들

#### `package.json` - 의존성 관리
```json
{
  "dependencies": {
    "react": "^18.2.0",           // React 라이브러리
    "@mui/material": "^5.15.20",  // Material-UI 컴포넌트
    "@reduxjs/toolkit": "^2.8.2", // Redux 상태 관리
    "axios": "^1.9.0",            // HTTP 클라이언트
    "react-router-dom": "^6.26.0" // 라우팅
  },
  "devDependencies": {
    "typescript": "~5.8.3",       // TypeScript 컴파일러
    "vite": "5.0.12",             // 빌드 도구
    "@vitejs/plugin-react": "^4.6.0" // Vite React 플러그인
  }
}
```

#### `vite.config.js` - 빌드 설정
```javascript
export default defineConfig({
  plugins: [react()],              // React 플러그인
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') } // 경로 별칭
  },
  server: {
    host: '0.0.0.0',              // 외부 접속 허용
    port: 3000,                   // 개발 서버 포트
    proxy: {                      // API 프록시 설정
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
});
```

### 🧩 핵심 컴포넌트들

#### `shared/components/ui/` - UI 컴포넌트 라이브러리

```typescript
// Button 컴포넌트 예시
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  children 
}) => {
  return (
    <MuiButton 
      variant={variant === 'primary' ? 'contained' : 'outlined'}
      size={size}
      onClick={onClick}
    >
      {children}
    </MuiButton>
  );
};
```

#### DataGrid 컴포넌트
```typescript
// 서버 사이드 데이터 그리드
const ServerDataGrid = ({ 
  columns, 
  apiUrl, 
  onRowClick 
}: ServerDataGridProps) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10 });

  // 서버에서 데이터 로드
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}?page=${pagination.page}&size=${pagination.pageSize}`);
      setData(response.data);
    } catch (error) {
      console.error('Data loading failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MuiDataGrid
      columns={columns}
      rows={data}
      loading={loading}
      pagination
      paginationModel={pagination}
      onPaginationModelChange={setPagination}
      onRowClick={onRowClick}
    />
  );
};
```

### 🔗 Provider 컴포넌트들

#### AuthProvider - 인증 상태 관리
```typescript
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 🚀 개발 시작하기

### 1. 📥 프로젝트 설정
```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 브라우저에서 확인
# http://localhost:3000
```

### 2. 🔧 개발 도구 설정
- **VS Code Extension 추천**:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer
  - Prettier - Code formatter
  - Material-UI Snippets

### 3. 📚 학습 리소스
- **React 공식 문서**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Material-UI 문서**: https://mui.com/
- **Redux Toolkit 가이드**: https://redux-toolkit.js.org/

---

## 🎯 마무리

이 문서는 ITCEN Solution Frontend의 아키텍처를 초보자도 이해할 수 있도록 상세히 설명했습니다. 

### 💡 핵심 포인트
1. **도메인 기반 구조**로 비즈니스 로직을 분리
2. **컴포넌트 재사용**으로 개발 효율성 증대  
3. **타입 안전성**으로 런타임 에러 방지
4. **중앙 상태 관리**로 데이터 일관성 유지

### 🔄 다음 단계
1. 간단한 페이지부터 개발 시작
2. 공통 컴포넌트 활용법 익히기
3. API 연동 패턴 학습
4. 점진적으로 복잡한 기능 구현

---

**Created by ITCEN Team** | 최종 업데이트: 2025.01