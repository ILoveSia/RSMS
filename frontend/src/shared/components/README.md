# 공통 컴포넌트 가이드

## 📋 컴포넌트 목록

### 🔘 버튼
- **Button** - 표준 버튼 (로딩 상태, 아이콘 지원)

### 📊 데이터 표시
- **DataGrid** - 클라이언트 사이드 테이블
- **ServerDataGrid** - 서버 사이드 테이블 (검색, 내보내기, 삭제)
- **Badge** - 상태 배지
- **Chip** - 태그/필터 칩
- **TextField** - 읽기 전용 텍스트 필드

### 📝 폼 입력
- **Select** - 드롭다운 선택 (단일/다중)
- **ComboBox** - 자동완성 선택
- **DatePicker** - 커스텀 달력
- **FileUpload** - 파일 업로드
- **CommonCodeSelect** - 공통코드 선택
- **LedgerOrdersHodSelect** - 책무번호 선택
- **PositionSelect** - 직책 선택

### 📐 레이아웃
- **PageContainer** - 페이지 컨테이너
- **PageHeader** - 페이지 헤더
- **PageContent** - 페이지 내용 영역
- **Card** - 카드 컨테이너

### 💬 피드백
- **Alert** - 알림 메시지
- **Loading** - 로딩 표시
- **Toast** - 토스트 알림

### 🧭 네비게이션
- **Breadcrumb** - 브레드크럼
- **Pagination** - 페이지네이션
- **NavigationMenu** - 동적 메뉴

### 🗂️ 모달
- **BaseDialog** - 기본 다이얼로그 (생성/편집/보기/읽기전용)
- **Alert** - 알림 다이얼로그
- **Confirm** - 확인 다이얼로그

### 📑 탭 시스템
- **TabContainer** - 탭 컨테이너
- **TabBar** - 탭 바

---

## 🚀 주요 컴포넌트 사용법

### Button
```tsx
import { Button } from '@/shared/components/ui/button';

// 기본 사용
<Button variant="contained" color="primary">저장</Button>

// 로딩 상태
<Button loading={isLoading} onClick={handleSubmit}>제출</Button>

// 아이콘 포함
<Button startIcon={<SaveIcon />}>저장</Button>
```

### DataGrid
```tsx
import { DataGrid } from '@/shared/components/ui/data-display';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: '이름', width: 150 },
  { field: 'email', headerName: '이메일', flex: 1 }
];

<DataGrid
  data={users}
  columns={columns}
  loading={isLoading}
  checkboxSelection
  onRowClick={handleRowClick}
/>
```

### ServerDataGrid
```tsx
import { ServerDataGrid } from '@/shared/components/ui/data-display';

const userApi = {
  fetchData: async (params) => {
    const response = await apiClient.get('/api/users', { params });
    return response.data;
  },
  deleteRows: async (ids) => {
    await apiClient.delete('/api/users', { data: { ids } });
  }
};

<ServerDataGrid
  api={userApi}
  columns={columns}
  searchable
  exportable
  deletable
/>
```

### Select
```tsx
import { Select } from '@/shared/components/ui/form';

const options = [
  { value: 'IT', label: 'IT부서' },
  { value: 'HR', label: '인사부서' }
];

<Select
  label="부서 선택"
  value={selectedDept}
  options={options}
  onChange={setSelectedDept}
  required
/>

// 다중 선택
<Select
  label="담당 업무"
  value={selectedTasks}
  options={taskOptions}
  multiple
/>
```

### DatePicker
```tsx
import { DatePicker } from '@/shared/components/ui/form';

<DatePicker
  label="시작일"
  value={startDate}
  onChange={setStartDate}
  maxDate={endDate}
  required
/>
```

### ComboBox
```tsx
import { ComboBox } from '@/shared/components/ui/form';

<ComboBox
  label="사용자 검색"
  value={selectedUser}
  options={userOptions}
  onChange={setSelectedUser}
  loading={isLoading}
/>

// 자유 입력 + 다중 선택
<ComboBox
  label="태그"
  value={tags}
  options={tagOptions}
  multiple
  freeSolo
/>
```

### LedgerOrdersHodSelect
```tsx
import { LedgerOrdersHodSelect } from '@/shared/components/ui/form';

<LedgerOrdersHodSelect
  label="책무번호"
  value={selectedHod}
  onChange={setSelectedHod}
  required
/>
```

### Page Layout
```tsx
import { PageContainer, PageHeader, PageContent } from '@/shared/components/ui/layout';

<PageContainer>
  <PageHeader 
    title="사용자 관리" 
    icon={<PersonIcon />}
    actions={
      <Button variant="contained" onClick={handleAdd}>
        사용자 추가
      </Button>
    }
  />
  <PageContent>
    <DataGrid data={users} columns={columns} />
  </PageContent>
</PageContainer>
```

### Alert
```tsx
import { Alert } from '@/shared/components/ui/feedback';

<Alert severity="success" title="성공">
  데이터가 저장되었습니다.
</Alert>

<Alert severity="error" closable onClose={handleClose}>
  오류가 발생했습니다.
</Alert>
```

### Loading
```tsx
import { Loading } from '@/shared/components/ui/feedback';

<Loading />
<Loading message="데이터 로딩 중..." />
<Loading overlay /> {/* 전체 화면 오버레이 */}
```

### Toast
```tsx
import { useToast } from '@/shared/components/ui/feedback';

const { showToast } = useToast();

const handleSuccess = () => {
  showToast('저장 완료!', 'success');
};

const handleError = () => {
  showToast('오류 발생', 'error');
};
```

### BaseDialog
```tsx
import BaseDialog from '@/shared/components/modal/BaseDialog';

<BaseDialog
  open={isOpen}
  mode="create" // 'create' | 'edit' | 'view' | 'onlyRead'
  title="사용자 등록"
  onClose={handleClose}
  onSave={handleSave}
  onModeChange={setMode}
  loading={isSaving}
>
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <TextField label="이름" value={name} onChange={setName} />
    <Select label="부서" value={dept} options={deptOptions} />
  </Box>
</BaseDialog>
```

### Breadcrumb
```tsx
import { Breadcrumb } from '@/shared/components/ui/navigation';

const items = [
  { id: 'home', label: '홈', href: '/', icon: <HomeIcon /> },
  { id: 'users', label: '사용자 관리', href: '/users' },
  { id: 'detail', label: '사용자 상세' }
];

<Breadcrumb items={items} />
```

---

## 💡 사용 패턴

### 목록 페이지 패턴
```tsx
<PageContainer>
  <PageHeader title="목록" actions={<Button>추가</Button>} />
  <PageContent>
    {/* 검색/필터 영역 */}
    <Box sx={{ mb: 2 }}>
      <Select label="상태" options={statusOptions} />
      <DatePicker label="기간" />
      <Button variant="contained">검색</Button>
    </Box>
    
    {/* 데이터 그리드 */}
    <DataGrid 
      data={data} 
      columns={columns}
      loading={isLoading}
      checkboxSelection
    />
  </PageContent>
</PageContainer>
```

### 폼 다이얼로그 패턴
```tsx
<BaseDialog
  open={open}
  mode={mode}
  title="등록/수정"
  onClose={handleClose}
  onSave={handleSave}
>
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <TextField label="필수 입력" required />
    <Select label="선택" options={options} />
    <DatePicker label="날짜" />
    <ComboBox label="검색 선택" options={searchOptions} />
  </Box>
</BaseDialog>
```

### 서버 데이터 패턴
```tsx
const api = {
  fetchData: async (params) => {
    const response = await apiClient.get('/api/data', { params });
    return response.data;
  },
  exportData: async (params) => {
    const response = await apiClient.get('/api/data/export', { 
      params, 
      responseType: 'blob' 
    });
    return response.data;
  },
  deleteRows: async (ids) => {
    await apiClient.delete('/api/data', { data: { ids } });
  }
};

<ServerDataGrid
  api={api}
  columns={columns}
  searchable
  exportable
  deletable
  autoRefresh
/>
```

---

## ⚡ 빠른 팁

### Import 방법
```tsx
// ✅ 권장: 구체적인 경로
import { Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';

// ❌ 지양: 상위 경로에서 모든 것
import { Button, DataGrid } from '@/shared/components/ui';
```

### 스타일링
```tsx
// sx prop 사용
<Button sx={{ mb: 2, width: '100%' }}>버튼</Button>

// 테마 변수 사용
<Button sx={{ color: 'bank.primary' }}>버튼</Button>
```

### 타입 안전성
```tsx
// 올바른 이벤트 타입
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // 처리 로직
};

// 제네릭 타입 사용
interface UserData {
  id: number;
  name: string;
  email: string;
}

<DataGrid<UserData>
  data={users}
  columns={columns}
  onRowClick={(user) => console.log(user.name)} // 타입 안전
/>
```

### 성능 최적화
- 큰 데이터: `ServerDataGrid` 사용
- 많은 옵션: `ComboBox` 가상화 활용
- 빈번한 업데이트: `React.memo` 적용

---

## 🚨 주의사항

1. **Import 경로**: 항상 절대 경로(`@/shared/components`) 사용
2. **타입 지정**: Props 타입을 정확히 명시
3. **접근성**: `aria-label` 등 접근성 속성 제공
4. **에러 처리**: 비동기 작업에 에러 처리 포함
5. **로딩 상태**: 사용자 경험을 위한 로딩 표시

---

## 📞 문의

- 개발팀 Slack: #frontend-dev
- 컴포넌트 개선 제안: GitHub Issues

**마지막 업데이트:** 2025년 7월 23일