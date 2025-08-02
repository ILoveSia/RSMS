# 업무 페이지 공통 버튼 컴포넌트 가이드

업무 페이지에서 자주 사용되는 버튼들을 공통 컴포넌트로 제공합니다.

## 📋 컴포넌트 목록

### 1. SearchButton - 조회 버튼
파란색 계열의 조회 전용 버튼입니다.

```tsx
import { SearchButton } from '@/shared/components/ui/button';

<SearchButton
  onClick={handleSearch}
  loading={isLoading}
  loadingText="검색중..."
  text="조회"
/>
```

### 2. ManagementButtonGroup - 관리 버튼 그룹
등록, 수정, 삭제 등 데이터 관리용 버튼들을 그룹으로 제공합니다.

```tsx
import { ManagementButtonGroup } from '@/shared/components/ui/button';

<ManagementButtonGroup
  onRegister={handleRegister}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onRefresh={handleRefresh}
  
  showRegister={true}
  showEdit={false}
  showDelete={true}
  showRefresh={true}
  
  registerDisabled={false}
  deleteDisabled={!selectedIds.length}
  refreshLoading={isLoading}
  
  align="right"
/>
```

### 3. ActionButtonGroup - 액션 버튼 그룹
다양한 액션 버튼들을 자유롭게 조합할 수 있는 범용 컴포넌트입니다.

```tsx
import { ActionButtonGroup } from '@/shared/components/ui/button';

<ActionButtonGroup
  buttons={[
    {
      type: 'search',
      onClick: handleSearch,
      loading: isLoading,
    },
    {
      type: 'register',
      onClick: handleRegister,
      disabled: false,
    },
    {
      type: 'delete',
      onClick: handleDelete,
      disabled: !selectedIds.length,
    },
    {
      type: 'custom',
      label: '승인',
      icon: <CheckIcon />,
      color: 'success',
      onClick: handleApprove,
    }
  ]}
  align="right"
  spacing={1}
/>
```

## 🎨 버튼 타입

### 기본 제공 버튼 타입

| 타입 | 라벨 | 색상 | 아이콘 | 용도 |
|------|------|------|--------|------|
| `search` | 조회 | primary | 🔍 | 데이터 검색 |
| `register` | 등록 | success | ➕ | 새 데이터 등록 |
| `delete` | 삭제 | error | 🗑️ | 데이터 삭제 |
| `refresh` | 새로고침 | primary (outlined) | 🔄 | 데이터 새로고침 |
| `edit` | 수정 | warning | ✏️ | 데이터 수정 |
| `save` | 저장 | success | 💾 | 데이터 저장 |
| `cancel` | 취소 | inherit (outlined) | ❌ | 작업 취소 |
| `custom` | 사용자 정의 | primary | - | 사용자 정의 |

## 📖 사용 예시

### 검색 영역에서 사용

```tsx
<SearchConditionPanel disabled={loading}>
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    {/* 검색 조건들 */}
    <TextField label="검색어" />
    <FormControl>
      <Select>...</Select>
    </FormControl>
  </Box>
  
  {/* 조회 버튼 */}
  <SearchButton
    onClick={handleSearch}
    loading={loading}
  />
</SearchConditionPanel>
```

### DataGrid 상단 버튼 영역

```tsx
{/* 관리 버튼들 */}
<ManagementButtonGroup
  onRegister={() => setDialogOpen(true)}
  onDelete={handleDelete}
  onRefresh={loadData}
  
  deleteDisabled={!selectedIds.length}
  refreshLoading={loading}
  
  align="right"
/>

{/* 또는 ActionButtonGroup 사용 */}
<ActionButtonGroup
  buttons={[
    {
      type: 'register',
      onClick: handleRegister,
    },
    {
      type: 'delete',
      onClick: handleDelete,
      disabled: !selectedIds.length,
    },
    {
      type: 'custom',
      label: '엑셀 다운로드',
      icon: <FileDownloadIcon />,
      color: 'secondary',
      onClick: handleExcelDownload,
    }
  ]}
  align="right"
/>
```

### 폼 하단 버튼 영역

```tsx
<ActionButtonGroup
  buttons={[
    {
      type: 'save',
      onClick: handleSave,
      loading: saving,
    },
    {
      type: 'cancel',
      onClick: handleCancel,
    }
  ]}
  align="center"
  spacing={2}
/>
```

## 🎯 실제 적용 예시

### 기존 코드
```tsx
<Button
  variant="contained"
  size="small"
  onClick={handleSearch}
  color="primary"
  disabled={loading}
  sx={{
    minWidth: '80px',
    fontWeight: 600,
  }}
>
  {loading ? '조회중...' : '조회'}
</Button>
```

### 새로운 코드
```tsx
<SearchButton
  onClick={handleSearch}
  loading={loading}
/>
```

## 🎨 스타일 커스터마이징

모든 컴포넌트는 `sx` prop을 통해 스타일을 커스터마이징할 수 있습니다.

```tsx
<SearchButton
  onClick={handleSearch}
  sx={{
    backgroundColor: '#2196f3',
    '&:hover': {
      backgroundColor: '#1976d2',
    }
  }}
/>
```

## 🚀 장점

1. **일관성**: 모든 업무 페이지에서 동일한 디자인의 버튼 사용
2. **재사용성**: 공통 로직과 스타일을 컴포넌트로 분리
3. **유지보수성**: 버튼 스타일 변경 시 한 곳에서만 수정
4. **개발 효율성**: 반복적인 버튼 코드 작성 시간 단축
5. **타입 안정성**: TypeScript로 props 타입 체크
6. **접근성**: 기본적인 접근성 고려사항 내장