# LedgerOrderSelect 컴포넌트

원장차수 선택을 위한 공통 SelectBox 컴포넌트입니다. API 호출, 로딩 상태, 에러 처리를 포함한 완전한 기능을 제공합니다.

## 기능

- ✅ 원장차수 목록 자동 로드 (`positionApi.getLedgerOrderSelectList()`)
- ✅ 로딩 상태 및 에러 처리
- ✅ "전체" 옵션 자동 추가 지원
- ✅ React key 중복 방지 (고유 키 생성)
- ✅ 커스터마이징 가능한 props
- ✅ TypeScript 완전 지원

## 기본 사용법

```tsx
import { LedgerOrderSelect } from '@/shared/components/ui/form';

const MyComponent = () => {
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('');

  return (
    <LedgerOrderSelect value={selectedLedgerOrder} onChange={setSelectedLedgerOrder} size='small' />
  );
};
```

## Props

| Prop             | 타입                                     | 기본값    | 설명                  |
| ---------------- | ---------------------------------------- | --------- | --------------------- |
| `value`          | `string`                                 | **필수**  | 선택된 값             |
| `onChange`       | `(value: string) => void`                | **필수**  | 값 변경 핸들러        |
| `size`           | `'small' \| 'medium'`                    | `'small'` | 컴포넌트 크기         |
| `sx`             | `SxProps<Theme>`                         | -         | 커스텀 스타일         |
| `includeAll`     | `boolean`                                | `true`    | "전체" 옵션 포함 여부 |
| `allLabel`       | `string`                                 | `'전체'`  | "전체" 옵션 라벨      |
| `allValue`       | `string`                                 | `''`      | "전체" 옵션 값        |
| `placeholder`    | `string`                                 | -         | 플레이스홀더 텍스트   |
| `disabled`       | `boolean`                                | `false`   | 비활성화 여부         |
| `error`          | `boolean`                                | `false`   | 에러 상태             |
| `helperText`     | `string`                                 | -         | 도움말 텍스트         |
| `minWidth`       | `number \| string`                       | `150`     | 최소 너비             |
| `maxWidth`       | `number \| string`                       | `200`     | 최대 너비             |
| `onLoadComplete` | `(options: LedgerOrderOption[]) => void` | -         | 로딩 완료 콜백        |
| `onError`        | `(error: string) => void`                | -         | 에러 발생 콜백        |

## 사용 예시

### 1. 기본 사용

```tsx
const [ledgerOrder, setLedgerOrder] = useState<string>('');

<LedgerOrderSelect value={ledgerOrder} onChange={setLedgerOrder} />;
```

### 2. "전체" 옵션 없이 사용

```tsx
<LedgerOrderSelect value={ledgerOrder} onChange={setLedgerOrder} includeAll={false} />
```

### 3. 커스텀 "전체" 옵션

```tsx
<LedgerOrderSelect
  value={ledgerOrder}
  onChange={setLedgerOrder}
  allLabel='모든 차수'
  allValue='ALL'
/>
```

### 4. 커스텀 스타일링

```tsx
<LedgerOrderSelect
  value={ledgerOrder}
  onChange={setLedgerOrder}
  size='medium'
  sx={{
    minWidth: 200,
    maxWidth: 300,
    backgroundColor: 'white',
  }}
/>
```

### 5. 콜백 함수 활용

```tsx
<LedgerOrderSelect
  value={ledgerOrder}
  onChange={setLedgerOrder}
  onLoadComplete={options => {
    console.log('원장차수 목록 로드 완료:', options);
  }}
  onError={error => {
    console.error('원장차수 로드 실패:', error);
  }}
/>
```

### 6. 실제 화면에서의 사용 (HodICitemStatusPage 예시)

```tsx
<Box
  sx={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    backgroundColor: 'var(--bank-bg-secondary)',
    border: '1px solid var(--bank-border)',
    padding: '8px 16px',
    borderRadius: '4px',
  }}
>
  <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>책무번호</span>
  <LedgerOrderSelect
    value={selectedLedgerOrder}
    onChange={setSelectedLedgerOrder}
    size='small'
    sx={{ minWidth: 150, maxWidth: 200 }}
  />
  <Button variant='contained' size='small' onClick={handleSearch} color='primary'>
    조회
  </Button>
</Box>
```

## 상태 관리

컴포넌트 내부에서 다음 상태들을 자동으로 관리합니다:

- 📡 **API 로딩 상태**: 원장차수 목록 조회 중
- ❌ **에러 상태**: API 호출 실패 시
- 📋 **옵션 목록**: 원장차수 데이터 + "전체" 옵션

## 기존 코드에서 마이그레이션

### Before (기존)

```tsx
// ❌ 각 화면마다 중복된 코드
const [ledgerOrderOptions, setLedgerOrderOptions] = useState<
  Array<{ value: string; label: string }>
>([]);

const fetchLedgerOrders = useCallback(async () => {
  try {
    const data = await positionApi.getLedgerOrderSelectList();
    setLedgerOrderOptions(data);
  } catch (err: unknown) {
    console.error('원장차수 목록 조회 실패:', err);
  }
}, []);

<Select
  value={selectedLedgerOrder}
  onChange={value => setSelectedLedgerOrder(value as string)}
  options={[
    { value: '', label: '전체' },
    ...ledgerOrderOptions.map(option => ({
      value: option.value,
      label: option.label,
    })),
  ]}
/>;
```

### After (공통 컴포넌트)

```tsx
// ✅ 간단하고 깔끔한 코드
<LedgerOrderSelect value={selectedLedgerOrder} onChange={setSelectedLedgerOrder} />
```

## 에러 처리

컴포넌트는 다음과 같은 에러 상황을 자동으로 처리합니다:

1. **API 호출 실패**: "로드 실패" 옵션 표시
2. **네트워크 오류**: 에러 콜백 호출
3. **빈 데이터**: "데이터 없음" 옵션 표시

## 타입 정의

```tsx
export interface LedgerOrderSelectProps {
  value: string;
  onChange: (value: string) => void;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
  includeAll?: boolean;
  allLabel?: string;
  allValue?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  minWidth?: number | string;
  maxWidth?: number | string;
  onLoadComplete?: (options: LedgerOrderOption[]) => void;
  onError?: (error: string) => void;
}

export interface LedgerOrderOption {
  value: string;
  label: string;
}
```

## 적용된 화면들

다음 화면들에서 공통 컴포넌트를 사용하도록 리팩토링되었습니다:

- ✅ `HodICitemStatusPage.tsx` - 부서장 내부통제 항목 현황
- ✅ `PositionStatusPage.tsx` - 직책 현황
- ✅ `ResponsibilityDbStatusPage.tsx` - 책무 DB 현황

## 장점

1. **코드 중복 제거**: 각 화면마다 반복되던 원장차수 로직 통합
2. **일관성**: 모든 화면에서 동일한 UX 제공
3. **유지보수성**: 한 곳에서 원장차수 관련 로직 관리
4. **타입 안전성**: TypeScript로 완전한 타입 지원
5. **에러 처리**: 자동화된 에러 상태 관리
6. **성능**: React key 중복 방지로 렌더링 최적화
