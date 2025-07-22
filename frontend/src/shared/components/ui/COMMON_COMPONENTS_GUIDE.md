# 🎨 ITCEN Solution 공통 컴포넌트 가이드 (2025년 현행화)

## 📝 개요

ITCEN Solution 프로젝트의 공통 UI 컴포넌트 라이브러리입니다. Material-UI v5를 기반으로 구축되었으며, 실제 서버와 연동되는 고도화된 컴포넌트들을 제공합니다.

### 🎯 핵심 원칙

- **💎 재사용성**: 도메인 전반에서 활용 가능한 범용 컴포넌트
- **🎨 일관성**: Material-UI 디자인 시스템 준수
- **⚡ 성능**: 최적화된 렌더링과 메모리 사용
- **🔒 타입 안전성**: TypeScript 완전 지원
- **🌐 서버 통합**: 실제 백엔드 API와 직접 연동
- **♿ 접근성**: WCAG 2.1 가이드라인 준수

### 🛠 기술 스택

- **React**: 18.2.0
- **TypeScript**: 5.8.3
- **Material-UI**: 5.15.20
- **MUI X DataGrid**: 7.7.1
- **Emotion**: 11.11.4 (스타일링)

## 📁 현재 폴더 구조

```
frontend/src/shared/components/ui/
├── button/                          # 버튼 컴포넌트
│   ├── Button.tsx
│   └── index.ts
├── form/                            # 폼 컴포넌트
│   ├── Select.tsx
│   ├── ComboBox.tsx
│   ├── DatePicker.tsx
│   ├── FileUpload.tsx
│   ├── ServerFileUpload.tsx         # 서버 통합 파일 업로드
│   ├── LedgerOrderSelect.tsx        # 도메인 특화 셀렉트
│   ├── LedgerOrdersHodSelect.tsx    # 부서장 승인 셀렉트
│   ├── CommonCodeSelect.tsx         # 공통코드 셀렉트
│   ├── types.ts
│   └── index.ts
├── data-display/                    # 데이터 표시 컴포넌트
│   ├── DataGrid.tsx
│   ├── ServerDataGrid.tsx           # 서버 페이지네이션 그리드
│   ├── TextField.tsx
│   ├── InfoCard.tsx
│   ├── Chip.tsx
│   ├── Badge.tsx
│   ├── types.ts
│   └── index.ts
├── feedback/                        # 피드백 컴포넌트
│   ├── Alert.tsx
│   ├── Modal.tsx
│   ├── Toast.tsx
│   ├── ToastProvider.tsx            # 전역 토스트 관리
│   ├── Loading.tsx
│   ├── LoadingProvider.tsx          # 전역 로딩 관리
│   ├── types.ts
│   └── index.ts
├── layout/                          # 레이아웃 컴포넌트
│   ├── Card.tsx
│   ├── Drawer.tsx
│   ├── Tabs.tsx
│   ├── PageContainer.tsx            # 페이지 컨테이너
│   ├── PageContent.tsx              # 페이지 콘텐츠
│   ├── PageHeader.tsx               # 페이지 헤더
│   └── index.ts
├── navigation/                      # 네비게이션 컴포넌트
│   ├── Breadcrumb.tsx
│   ├── Pagination.tsx
│   ├── Stepper.tsx
│   ├── types.ts
│   └── index.ts
├── DataList.tsx                     # 데이터 리스트
├── SearchBox.tsx                    # 검색 박스
├── index.ts                         # 전체 export
├── COMMON_COMPONENTS_GUIDE.md       # 이 파일
└── COMPONENT_EXAMPLES.md            # 사용 예시
```

## 🏷 컴포넌트 분류 및 네이밍

### 📂 카테고리별 컴포넌트

#### 🔘 Button (버튼)
- **Button**: 기본 버튼 컴포넌트

#### 📝 Form (폼 컴포넌트)
- **Select**: 기본 선택 컴포넌트
- **ComboBox**: 자동완성 지원 콤보박스
- **DatePicker**: 날짜 선택기
- **FileUpload**: 기본 파일 업로드
- **ServerFileUpload**: 서버 통합 파일 업로드
- **CommonCodeSelect**: 공통코드 기반 선택 컴포넌트
- **LedgerOrderSelect**: 원장 주문 선택 컴포넌트
- **LedgerOrdersHodSelect**: 부서장 승인 원장 선택 컴포넌트

#### 📊 Data Display (데이터 표시)
- **DataGrid**: 클라이언트 사이드 데이터 그리드
- **ServerDataGrid**: 서버 사이드 페이지네이션 그리드
- **TextField**: 텍스트 필드
- **InfoCard**: 정보 카드
- **Chip**: 태그/라벨 컴포넌트
- **Badge**: 뱃지 컴포넌트

#### 💬 Feedback (피드백)
- **Alert**: 알림 컴포넌트
- **Modal**: 모달 다이얼로그
- **Toast**: 토스트 메시지
- **ToastProvider**: 전역 토스트 관리자
- **Loading**: 로딩 스피너
- **LoadingProvider**: 전역 로딩 관리자

#### 🏗 Layout (레이아웃)
- **Card**: 카드 컨테이너
- **Drawer**: 서랍형 사이드바
- **Tabs**: 탭 컨테이너
- **PageContainer**: 페이지 전체 컨테이너
- **PageContent**: 페이지 콘텐츠 영역
- **PageHeader**: 페이지 헤더

#### 🧭 Navigation (네비게이션)
- **Breadcrumb**: 브레드크럼 네비게이션
- **Pagination**: 페이지네이션
- **Stepper**: 단계별 진행 표시기

### 📛 네이밍 규칙

#### 컴포넌트명
- **PascalCase** 사용
- **Server 접두사**: 서버 통합 컴포넌트 (`ServerDataGrid`, `ServerFileUpload`)
- **도메인 접두사**: 특정 도메인용 컴포넌트 (`LedgerOrderSelect`)
- **기능 중심**: 역할과 기능이 명확히 드러나는 이름

#### 파일명
- **컴포넌트**: `ComponentName.tsx`
- **인덱스**: `index.ts` (export 전용)
- **타입**: `types.ts`
- **예시**: `Button.tsx`, `ServerDataGrid.tsx`

#### Props 인터페이스
```typescript
// 기본 패턴: 컴포넌트명 + Props
interface ButtonProps extends BaseComponentProps {
  // props 정의
}

// 제네릭 타입 사용
interface DataGridProps<T = any> extends BaseComponentProps {
  // 제네릭 props
}

// 서버 통합 컴포넌트
interface ServerDataGridProps<T = any> extends DataGridProps<T> {
  // 서버 관련 추가 props
}
```

## 🏗 컴포넌트 설계 원칙

### 📋 기본 타입 시스템

#### BaseComponentProps
```typescript
// shared/types/common.ts에서 정의
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
  sx?: any; // Material-UI sx prop
}
```

#### FormComponentProps
```typescript
export interface FormComponentProps extends BaseComponentProps {
  label?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}
```

### 🎯 Props 설계 패턴

#### 1. 기본 컴포넌트 (Button 예시)
```typescript
interface ButtonProps extends BaseComponentProps {
  // 필수 props
  children: React.ReactNode;

  // Material-UI 표준 props
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

  // 이벤트 핸들러
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  // 상태 관련
  disabled?: boolean;
  loading?: boolean;
}
```

#### 2. 서버 통합 컴포넌트 (ServerDataGrid 예시)
```typescript
interface ServerDataGridProps<T = any> {
  // API 관련
  apiUrl: string;
  queryParams?: Record<string, any>;
  
  // 데이터 변환
  transformData?: (data: any) => T[];
  
  // 이벤트 핸들러
  onError?: (error: Error) => void;
  onLoadComplete?: (data: T[]) => void;
  
  // 기본 DataGrid props 상속
  columns: DataGridColumn<T>[];
  // ... 기타 props
}
```

#### 3. 도메인 특화 컴포넌트 (CommonCodeSelect 예시)
```typescript
interface CommonCodeSelectProps {
  // 도메인 특화 props
  groupCode: string;
  includeAll?: boolean;
  allLabel?: string;
  allValue?: string;
  
  // 기본 Select props
  value: string;
  onChange: (value: string) => void;
  
  // 확장 props
  onLoadComplete?: (options: CommonCodeOption[]) => void;
  onError?: (error: string) => void;
}
```

### ⚙️ 구현 패턴

#### 기본값 설정
```typescript
const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  size = 'medium',
  color = 'primary',
  disabled = false,
  loading = false,
  children,
  ...props
}) => {
  return (
    <MuiButton
      variant={variant}
      size={size}
      color={color}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <CircularProgress size={20} /> : children}
    </MuiButton>
  );
};
```

#### forwardRef 패턴
```typescript
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiButton ref={ref} {...props}>
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';
```

## 📖 컴포넌트 사용법

### 📦 Import 방법

#### 개별 Import (권장)
```typescript
import { 
  Button, 
  DataGrid, 
  ServerDataGrid,
  CommonCodeSelect,
  ToastProvider,
  useToast,
  useLoading 
} from '@/shared/components/ui';
```

#### 카테고리별 Import
```typescript
import { Button } from '@/shared/components/ui/button';
import { DataGrid, ServerDataGrid } from '@/shared/components/ui/data-display';
import { useToast, useLoading } from '@/shared/components/ui/feedback';
```

### 🎯 핵심 컴포넌트 사용 예시

#### 1. ServerDataGrid (서버 페이지네이션)
```typescript
import { ServerDataGrid } from '@/shared/components/ui';
import type { DataGridColumn } from '@/shared/types/common';

interface UserData {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const UserListPage: React.FC = () => {
  const columns: DataGridColumn<UserData>[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: '이름', width: 150 },
    { field: 'email', headerName: '이메일', width: 200 },
    { 
      field: 'createdAt', 
      headerName: '생성일', 
      width: 150,
      renderCell: ({ value }) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <ServerDataGrid<UserData>
      apiUrl="/api/users"
      columns={columns}
      queryParams={{ status: 'active' }}
      onRowClick={(row) => console.log('클릭된 행:', row)}
      autoHeight
    />
  );
};
```

#### 2. CommonCodeSelect (공통코드 선택)
```typescript
import { CommonCodeSelect } from '@/shared/components/ui';

const FormComponent: React.FC = () => {
  const [userType, setUserType] = useState<string>('');

  return (
    <CommonCodeSelect
      groupCode="USER_TYPE"
      value={userType}
      onChange={setUserType}
      includeAll={true}
      allLabel="전체"
      placeholder="사용자 유형을 선택하세요"
      onLoadComplete={(options) => console.log('로드된 옵션:', options)}
    />
  );
};
```

#### 3. ToastProvider & useToast (전역 알림)
```typescript
// App.tsx에서 Provider 설정
import { ToastProvider } from '@/shared/components/ui';

const App: React.FC = () => {
  return (
    <ToastProvider maxToasts={5}>
      <YourApplication />
    </ToastProvider>
  );
};

// 컴포넌트에서 사용
import { useToast } from '@/shared/components/ui';

const MyComponent: React.FC = () => {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast({
      message: '성공적으로 저장되었습니다!',
      severity: 'success',
      autoHideDuration: 3000
    });
  };

  const handleError = () => {
    showToast({
      message: '오류가 발생했습니다.',
      severity: 'error'
    });
  };

  return (
    <div>
      <Button onClick={handleSuccess}>성공 메시지</Button>
      <Button onClick={handleError} color="error">에러 메시지</Button>
    </div>
  );
};
```

#### 4. LoadingProvider & useLoading (전역 로딩)
```typescript
// App.tsx에서 Provider 설정
import { LoadingProvider } from '@/shared/components/ui';

const App: React.FC = () => {
  return (
    <LoadingProvider>
      <YourApplication />
    </LoadingProvider>
  );
};

// 컴포넌트에서 사용
import { useLoading, useToast } from '@/shared/components/ui';

const DataProcessor: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();

  const handleSubmit = async () => {
    showLoading('데이터 처리 중...');
    
    try {
      await processData();
      showToast({ message: '처리 완료!', severity: 'success' });
    } catch (error) {
      showToast({ message: '처리 실패', severity: 'error' });
    } finally {
      hideLoading();
    }
  };

  return <Button onClick={handleSubmit}>데이터 처리</Button>;
};
```

#### 5. 페이지 레이아웃 컴포넌트
```typescript
import { 
  PageContainer, 
  PageHeader, 
  PageContent,
  Button 
} from '@/shared/components/ui';

const MyPage: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader 
        title="사용자 관리"
        subtitle="시스템 사용자를 관리합니다"
        action={
          <Button variant="contained">
            새 사용자 추가
          </Button>
        }
      />
      <PageContent>
        {/* 페이지 내용 */}
        <ServerDataGrid apiUrl="/api/users" columns={columns} />
      </PageContent>
    </PageContainer>
  );
};
```

### 🔗 Material-UI 활용 가이드

#### 테마 시스템 활용
```typescript
import { useTheme } from '@mui/material/styles';

const CustomComponent: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        p: 2,
        borderRadius: theme.shape.borderRadius,
      }}
    >
      테마 기반 스타일링
    </Box>
  );
};
```

#### sx Prop 활용
```typescript
<Button
  sx={{
    minWidth: 120,
    '&:hover': {
      transform: 'scale(1.05)',
    },
  }}
>
  호버 효과가 있는 버튼
</Button>
```

## ⚠️ 중요 주의사항

### 🚨 MUI X DataGrid v7.7.1 사용 시 주의점

#### 높이 관련 오류 해결
```
MUI X: useResizeContainer - The parent DOM element of the Data Grid has an empty height.
```

**해결 방법:**
1. **autoHeight 속성 사용 (권장)**
```typescript
<ServerDataGrid
  apiUrl="/api/data"
  columns={columns}
  autoHeight  // 👈 이 속성으로 높이 문제 해결
/>
```

2. **명시적 높이 설정**
```typescript
<ServerDataGrid
  apiUrl="/api/data"
  columns={columns}
  height={600}  // 고정 높이
/>
```

### 📋 개발 모범 사례

#### 1. Provider 설정 순서 (App.tsx)
```typescript
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoadingProvider>      {/* 1. 로딩 관리 */}
        <ToastProvider>      {/* 2. 토스트 관리 */}
          <AuthProvider>     {/* 3. 인증 관리 */}
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
};
```

#### 2. 에러 처리 패턴
```typescript
const MyComponent: React.FC = () => {
  const { showToast } = useToast();

  const handleError = (error: Error) => {
    console.error('컴포넌트 에러:', error);
    showToast({
      message: '처리 중 오류가 발생했습니다.',
      severity: 'error'
    });
  };

  return (
    <ServerDataGrid
      apiUrl="/api/data"
      columns={columns}
      onError={handleError}
      autoHeight
    />
  );
};
```

#### 3. 타입 안전성 확보
```typescript
// 제네릭 타입 활용
interface MyData {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

const MyGrid: React.FC = () => {
  return (
    <ServerDataGrid<MyData>  // 👈 타입 명시
      apiUrl="/api/my-data"
      columns={columns}
      onRowClick={(row) => {
        // row는 MyData 타입으로 추론됨
        console.log(row.name);
      }}
    />
  );
};
```

## 🔧 문제해결 가이드

### 자주 발생하는 문제들

#### 1. DataGrid 높이 문제
**증상**: 빈 화면 또는 높이 경고
**해결**: `autoHeight` 속성 추가

#### 2. Provider 관련 오류
**증상**: `useToast is not a function`
**해결**: 해당 Provider로 컴포넌트 감싸기

#### 3. 타입 오류
**증상**: TypeScript 컴파일 에러
**해결**: 제네릭 타입 명시 또는 타입 import 확인

#### 4. 스타일 충돌
**증상**: 예상과 다른 스타일
**해결**: sx prop 사용하여 Material-UI 우선순위 활용

## 📚 추가 리소스

### 공식 문서 링크
- [Material-UI v5 문서](https://mui.com/material-ui/)
- [MUI X DataGrid 문서](https://mui.com/x/react-data-grid/)
- [React 18 문서](https://react.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)

### 프로젝트 내 관련 파일
- `frontend/src/shared/types/common.ts` - 공통 타입 정의
- `frontend/src/shared/components/ui/COMPONENT_EXAMPLES.md` - 상세 사용 예시
- `frontend/src/app/theme/` - Material-UI 테마 설정

---

**📅 최종 업데이트**: 2025년 1월  
**🏢 작성자**: ITCEN Team  
**📊 버전**: v2.0 (현행화)
