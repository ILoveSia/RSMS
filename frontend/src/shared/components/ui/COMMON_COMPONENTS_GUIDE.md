# 공통 컴포넌트 개발 가이드

## 1. 개요

ITCEN Solution 프로젝트에서 사용하는 공통 컴포넌트들의 설계 및 개발 가이드입니다.

### 기본 원칙

- **재사용성**: 여러 곳에서 사용할 수 있도록 설계
- **일관성**: 동일한 스타일과 동작을 보장
- **확장성**: 새로운 기능 추가가 용이하도록 설계
- **접근성**: 웹 접근성 가이드라인 준수
- **TypeScript**: 타입 안정성 확보
- **서버 통합**: 실제 서버와 연동되는 컴포넌트 제공

## 2. 폴더 구조

```
frontend/src/shared/components/ui/
├── button/
│   ├── Button.tsx
│   ├── IconButton.tsx
│   ├── LoadingButton.tsx
│   └── index.ts
├── form/
│   ├── Select.tsx
│   ├── ComboBox.tsx
│   ├── DatePicker.tsx
│   ├── FileUpload.tsx
│   ├── ServerFileUpload.tsx
│   └── index.ts
├── data-display/
│   ├── DataGrid.tsx
│   ├── ServerDataGrid.tsx
│   ├── Chip.tsx
│   ├── Badge.tsx
│   └── index.ts
├── feedback/
│   ├── Alert.tsx
│   ├── Modal.tsx
│   ├── Toast.tsx
│   ├── ToastProvider.tsx
│   ├── Loading.tsx
│   ├── LoadingProvider.tsx
│   └── index.ts
├── layout/
│   ├── Container.tsx
│   ├── Grid.tsx
│   ├── Stack.tsx
│   └── index.ts
├── navigation/
│   ├── Breadcrumb.tsx
│   ├── NavigationMenu.tsx
│   └── index.ts
├── DataList.tsx
├── SearchBox.tsx
└── index.ts
```

## 3. 네이밍 컨벤션

### 컴포넌트 명

- **PascalCase** 사용: `Button`, `DataGrid`, `ComboBox`, `ServerDataGrid`
- **기능 명확성**: 컴포넌트의 역할이 명확히 드러나도록 명명
- **서버 통합**: 서버와 통합된 컴포넌트는 `Server` 접두사 사용
- **접두사 규칙**: 공통 컴포넌트는 접두사 없이 사용

### 파일 명

- **컴포넌트 파일**: `Button.tsx`, `DataGrid.tsx`, `ServerDataGrid.tsx`
- **타입 파일**: `types.ts`
- **스타일 파일**: `styles.ts` (styled-components 사용 시)
- **테스트 파일**: `Button.test.tsx`

### Props 인터페이스

```typescript
// 컴포넌트명 + Props 접미사
interface ButtonProps {
  // props 정의
}

interface DataGridProps<T> {
  // 제네릭 타입 사용
}

interface ServerDataGridProps<T> {
  // 서버 통합 컴포넌트 props
}
```

## 4. 컴포넌트 설계 원칙

### 4.1 Props 설계

```typescript
interface BaseProps {
  // 공통 props
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
}

interface ButtonProps extends BaseProps {
  // 필수 props
  children: React.ReactNode;

  // 선택적 props (기본값 제공)
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

### 4.2 기본값 설정

```typescript
const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  size = 'medium',
  color = 'primary',
  disabled = false,
  loading = false,
  ...props
}) => {
  // 구현
};
```

### 4.3 forwardRef 사용

```typescript
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  return (
    <MuiButton ref={ref} {...props}>
      {children}
    </MuiButton>
  );
});

Button.displayName = 'Button';
```

## 5. Material-UI 활용 가이드

### 5.1 테마 활용

```typescript
import { useTheme } from '@mui/material/styles';

const MyComponent: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      }}
    >
      Content
    </Box>
  );
};
```

### 5.2 sx prop 활용

```typescript
interface ComponentProps {
  sx?: SxProps<Theme>;
}

const Component: React.FC<ComponentProps> = ({ sx, ...props }) => {
  return (
    <Box
      sx={{
        // 기본 스타일
        p: 2,
        borderRadius: 1,
        // 사용자 정의 스타일 병합
        ...sx,
      }}
      {...props}
    />
  );
};
```

## 6. 타입 정의 가이드

### 6.1 공통 타입

```typescript
// shared/types/common.ts
export type Size = 'small' | 'medium' | 'large';
export type Color = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
export type Variant = 'contained' | 'outlined' | 'text';

export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
}
```

### 6.2 제네릭 타입

```typescript
// DataGrid 예시
export interface DataGridProps<T = any> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T, index: number) => void;
  onRowSelect?: (selectedRows: T[]) => void;

  // 높이 관련 props
  height?: number | string;
  autoHeight?: boolean;
  maxHeight?: number | string;
}

export interface Column<T = any> {
  field: keyof T;
  headerName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
}

// 서버 통합 컴포넌트 타입
export interface ServerDataGridProps<T = any> extends DataGridProps<T> {
  apiUrl: string;
  queryParams?: Record<string, any>;
  transformData?: (data: any) => T[];
  onError?: (error: Error) => void;
}
```

## 7. 스타일링 가이드

### 7.1 Material-UI 테마 확장

```typescript
// theme/index.ts
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      borderRadius: {
        small: number;
        medium: number;
        large: number;
      };
    };
  }
}

const theme = createTheme({
  custom: {
    borderRadius: {
      small: 4,
      medium: 8,
      large: 12,
    },
  },
});
```

### 7.2 일관된 스타일 적용

```typescript
// constants/styles.ts
export const COMMON_STYLES = {
  button: {
    borderRadius: '8px',
    textTransform: 'none' as const,
    fontWeight: 500,
  },
  input: {
    borderRadius: '6px',
  },
  card: {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
};
```

## 8. 높이 관련 문제 해결 가이드

### 8.1 DataGrid 높이 문제

**문제:** MUI X DataGrid v7에서 높이 관련 오류 발생

```
MUI X: useResizeContainer - The parent DOM element of the Data Grid has an empty height.
```

**해결 방법:**

1. **autoHeight 속성 사용 (권장)**

```typescript
<DataGrid
  data={data}
  columns={columns}
  autoHeight // 자동 높이 조정
/>
```

2. **고정 높이 설정**

```typescript
<DataGrid
  data={data}
  columns={columns}
  height={600} // 고정 높이
/>
```

3. **부모 컨테이너 높이 보장**

```typescript
<Box sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
  <DataGrid data={data} columns={columns} height='100%' />
</Box>
```

### 8.2 레이아웃 높이 설정

```typescript
// 탭 시스템에서 DataGrid 사용 시
const TabWithDataGrid: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TabContainer>
        <TabContent>
          <DataGrid
            data={data}
            columns={columns}
            autoHeight // 부모 높이에 의존하지 않음
          />
        </TabContent>
      </TabContainer>
    </Box>
  );
};
```

## 9. 글로벌 상태 관리 시스템

### 9.1 Toast 시스템

```typescript
// Provider 설정
import { ToastProvider } from '@/shared/components/ui/feedback';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
};

// 사용 예시
import { useToast } from '@/shared/components/ui/feedback';

const MyComponent: React.FC = () => {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast('저장되었습니다.', 'success');
  };

  const handleError = () => {
    showToast('오류가 발생했습니다.', 'error');
  };

  return <Button onClick={handleSuccess}>저장</Button>;
};
```

### 9.2 Loading 시스템

```typescript
// Provider 설정
import { LoadingProvider } from '@/shared/components/ui/feedback';

const App: React.FC = () => {
  return (
    <LoadingProvider>
      <YourApp />
    </LoadingProvider>
  );
};

// 사용 예시
import { useLoading } from '@/shared/components/ui/feedback';

const MyComponent: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();

  const handleSubmit = async () => {
    showLoading('저장 중...');
    try {
      await api.saveData();
      showToast('저장되었습니다.', 'success');
    } catch (error) {
      showToast('저장 실패', 'error');
    } finally {
      hideLoading();
    }
  };

  return <Button onClick={handleSubmit}>저장</Button>;
};
```

## 10. 서버 통합 컴포넌트

### 10.1 ServerDataGrid

```typescript
interface ServerDataGridProps<T> extends DataGridProps<T> {
  apiUrl: string;
  queryParams?: Record<string, any>;
  transformData?: (data: any) => T[];
  onError?: (error: Error) => void;
}

const ServerDataGrid = <T>({
  apiUrl,
  queryParams = {},
  transformData,
  onError,
  ...props
}: ServerDataGridProps<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로딩 로직
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(apiUrl, { params: queryParams });
      const processedData = transformData ? transformData(response.data) : response.data;
      setData(processedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '데이터 로딩 실패';
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return <DataGrid data={data} loading={loading} error={error} autoHeight {...props} />;
};
```

### 10.2 ServerFileUpload

```typescript
interface ServerFileUploadProps {
  uploadUrl: string;
  onSuccess?: (files: UploadedFile[]) => void;
  onError?: (error: Error) => void;
  maxSize?: number;
  acceptedTypes?: string[];
  multiple?: boolean;
}

const ServerFileUpload: React.FC<ServerFileUploadProps> = ({
  uploadUrl,
  onSuccess,
  onError,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'application/pdf'],
  multiple = false,
}) => {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();

  const handleUpload = async (files: File[]) => {
    showLoading('파일 업로드 중...');
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await api.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSuccess?.(response.data);
      showToast('파일 업로드 완료', 'success');
    } catch (error) {
      onError?.(error as Error);
      showToast('파일 업로드 실패', 'error');
    } finally {
      hideLoading();
    }
  };

  return (
    <FileUpload
      onUpload={handleUpload}
      maxSize={maxSize}
      acceptedTypes={acceptedTypes}
      multiple={multiple}
    />
  );
};
```

## 11. 접근성 가이드

### 11.1 ARIA 속성

```typescript
const Button: React.FC<ButtonProps> = ({
  children,
  loading,
  disabled,
  'aria-label': ariaLabel,
  ...props
}) => {
  return (
    <MuiButton
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-disabled={disabled || loading}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <CircularProgress size={20} /> : children}
    </MuiButton>
  );
};
```

### 11.2 키보드 네비게이션

```typescript
const onKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onClick?.(event as any);
  }
};
```

## 12. 테스트 가이드

### 12.1 단위 테스트

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 12.2 통합 테스트

```typescript
// ServerDataGrid.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import ServerDataGrid from './ServerDataGrid';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, name: 'John', email: 'john@example.com' }]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ServerDataGrid', () => {
  it('loads and displays data', async () => {
    const columns = [
      { field: 'name', headerName: 'Name' },
      { field: 'email', headerName: 'Email' },
    ];

    render(<ServerDataGrid apiUrl='/api/users' columns={columns} />);

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });
});
```

## 13. 성능 최적화 가이드

### 13.1 React.memo 사용

```typescript
const Button = React.memo<ButtonProps>(({ children, ...props }) => {
  return <MuiButton {...props}>{children}</MuiButton>;
});
```

### 13.2 useMemo, useCallback 활용

```typescript
const DataGrid: React.FC<DataGridProps<T>> = ({ data, columns, onRowClick }) => {
  const memoizedColumns = useMemo(
    () =>
      columns.map(col => ({
        ...col,
        renderCell: col.renderCell || (value => value),
      })),
    [columns]
  );

  const handleRowClick = useCallback(
    (row: T, index: number) => {
      onRowClick?.(row, index);
    },
    [onRowClick]
  );

  // 구현
};
```

## 14. 에러 처리 가이드

### 14.1 Error Boundary

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

class ComponentErrorBoundary extends React.Component<ErrorBoundaryProps> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        <this.props.fallback error={this.state.error} />
      ) : (
        <Alert severity='error'>컴포넌트 오류가 발생했습니다.</Alert>
      );
    }

    return this.props.children;
  }
}
```

### 14.2 런타임 에러 처리

```typescript
const DataGrid: React.FC<DataGridProps<T>> = ({ data, columns }) => {
  try {
    // 데이터 처리 로직
    const processedData = data.map(item => ({
      ...item,
      _id: item.id || Math.random().toString(36),
    }));

    return <MuiDataGrid rows={processedData} columns={columns} autoHeight />;
  } catch (error) {
    console.error('DataGrid 렌더링 에러:', error);
    return <Alert severity='error'>데이터를 표시할 수 없습니다.</Alert>;
  }
};
```

## 15. 문제 해결 사례

### 15.1 DataGrid 높이 문제 해결

**문제 상황:**

```
MUI X: useResizeContainer - The parent DOM element of the Data Grid has an empty height.
```

**해결 과정:**

1. 복잡한 flex 레이아웃 시도 → 실패
2. 고정 높이 설정 → 부분적 해결
3. 동적 높이 계산 → 복잡하고 불안정
4. **autoHeight 속성 사용** → 최종 해결

**최종 해결책:**

```typescript
<DataGrid
  data={data}
  columns={columns}
  autoHeight // 이 속성으로 모든 높이 문제 해결
/>
```

### 15.2 탭 시스템에서 DataGrid 사용

**문제:** 탭 내부에서 DataGrid 높이가 제대로 계산되지 않는 문제

**해결책:**

```typescript
// TabContainer에서 flex 레이아웃 사용
<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
  <TabContainer>
    <TabContent>
      <DataGrid autoHeight /> // autoHeight로 해결
    </TabContent>
  </TabContainer>
</Box>
```

## 16. 사용 예시

### 16.1 컴포넌트 import

```typescript
// 개별 import
import { Button, DataGrid, ComboBox } from '@/shared/components/ui';

// 또는 구체적 import
import Button from '@/shared/components/ui/button/Button';
import DataGrid from '@/shared/components/ui/data-display/DataGrid';
import { useToast, useLoading } from '@/shared/components/ui/feedback';
```

### 16.2 기본 사용 패턴

```typescript
const MyPage: React.FC = () => {
  const { showToast } = useToast();
  const { showLoading, hideLoading } = useLoading();

  const handleSubmit = async () => {
    showLoading('처리 중...');
    try {
      await api.submit();
      showToast('처리 완료', 'success');
    } catch (error) {
      showToast('처리 실패', 'error');
    } finally {
      hideLoading();
    }
  };

  return (
    <Box>
      <ServerDataGrid apiUrl='/api/data' columns={columns} autoHeight />
      <Button onClick={handleSubmit}>제출</Button>
    </Box>
  );
};
```

## 17. 버전 관리 및 호환성

### 17.1 MUI X DataGrid 버전 관리

**현재 버전:** v7.7.1

- autoHeight 속성 필수
- 높이 체크가 더 엄격해짐
- 성능 최적화 개선

**이전 버전 호환성:**

```typescript
// v6 이하에서는 autoHeight 없이도 동작
// v7 이상에서는 autoHeight 권장
const DataGrid: React.FC<Props> = ({ ...props }) => {
  return (
    <MuiDataGrid
      {...props}
      autoHeight={props.autoHeight ?? true} // 기본값으로 true 설정
    />
  );
};
```

### 17.2 점진적 업그레이드

```typescript
// 기존 코드와 호환되도록 점진적 업그레이드
const LegacyDataGrid: React.FC<Props> = ({ height, ...props }) => {
  return (
    <DataGrid
      {...props}
      autoHeight={!height} // height가 없으면 autoHeight 사용
      height={height}
    />
  );
};
```

이 가이드를 따라 개발하면 일관되고 안정적인 공통 컴포넌트를 만들 수 있습니다.
