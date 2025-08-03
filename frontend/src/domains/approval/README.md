# 결재 시스템 통합 가이드

## 개요
3단계 결재 시스템을 기존 업무 페이지에 통합하는 방법을 설명합니다.

## 주요 컴포넌트

### 1. ApprovalActionButton
업무 페이지에서 사용하는 스마트 결재 버튼입니다.

```tsx
import ApprovalActionButton from '@/shared/components/approval/ApprovalActionButton';

<ApprovalActionButton
  taskType="EXECUTIVE_STATUS"        // 업무 유형
  taskId={1}                        // 업무 고유 ID
  taskTitle="임원 현황 관리"         // 업무 제목
  currentUserId="user001"           // 현재 사용자 ID
  onApprovalStateChange={handleChange}  // 결재 상태 변경 콜백
  size="small"
  variant="contained"
/>
```

### 2. 결재 관리 페이지
- `ApprovalDashboardPage`: 결재 대시보드
- `MyApprovalListPage`: 내 결재 목록
- `ApprovalHistoryPage`: 결재 히스토리

### 3. 결재 다이얼로그
- `ApprovalSubmitPopup`: 결재 상신 팝업
- `InlineApprovalDialog`: 인라인 결재 처리
- `ApprovalStatusDialog`: 결재 현황 조회

## 통합 방법

### 1. 기존 업무 페이지에 결재 버튼 추가

```tsx
// 기존 페이지에 import 추가
import ApprovalActionButton from '@/shared/components/approval/ApprovalActionButton';

// 버튼 영역에 추가
<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
  <ApprovalActionButton
    taskType="YOUR_TASK_TYPE"
    taskId={yourTaskId}
    taskTitle="업무 제목"
    currentUserId={currentUserId}
    onApprovalStateChange={() => {
      // 결재 상태 변경 시 처리할 로직
      console.log('결재 상태 변경됨');
    }}
  />
  <Divider orientation="vertical" flexItem />
  {/* 기존 버튼들 */}
</Box>
```

### 2. 라우터에 결재 페이지 등록

```tsx
// app/router/routes.tsx에 추가
import { approvalRoutes } from '@/domains/approval/router';

const routes = [
  ...approvalRoutes,
  // 기존 라우트들
];
```

### 3. 메뉴에 결재 관리 추가

```tsx
// 메뉴 설정에 추가
{
  id: 'approval',
  title: '결재 관리',
  children: [
    { id: 'approval-dashboard', title: '결재 대시보드', path: '/approval' },
    { id: 'approval-my-list', title: '내 결재 목록', path: '/approval/my-list' },
    { id: 'approval-history', title: '결재 히스토리', path: '/approval/history' },
  ]
}
```

## 버튼 상태 변화

결재 버튼은 상황에 따라 자동으로 변화합니다:

1. **결재상신**: 아직 결재가 시작되지 않은 경우
2. **승인/반려**: 내가 결재해야 할 단계인 경우
3. **결재현황**: 다른 사람이 결재 중이거나 완료된 경우
4. **취소됨**: 결재가 취소된 경우

## 테스트 시나리오

### 1. 결재 상신 테스트
1. 업무 페이지에서 "결재상신" 버튼 클릭
2. 결재자 선택 팝업에서 3단계 결재자 선택
3. 상신 사유 입력 후 제출
4. 버튼이 "결재현황"으로 변경되는지 확인

### 2. 결재 처리 테스트
1. 결재자 계정으로 로그인
2. 내 결재 목록에서 대기 중인 결재 확인
3. 업무 페이지에서 "승인" 또는 "반려" 버튼 확인
4. 결재 처리 후 다음 단계로 넘어가는지 확인

### 3. 결재 현황 조회 테스트
1. "결재현황" 버튼 클릭
2. 결재 단계별 진행 상황 확인
3. 각 결재자의 처리 상태 및 의견 확인

## 주의사항

1. **taskType**: 각 업무별로 고유한 taskType을 정의해야 합니다
2. **taskId**: DB의 실제 레코드 ID를 사용해야 합니다
3. **currentUserId**: 로그인한 사용자의 실제 ID를 전달해야 합니다
4. **권한 체크**: 결재 권한이 있는 사용자만 결재 처리할 수 있습니다

## API 연동

결재 시스템은 다음 API를 사용합니다:

- `POST /api/approvals`: 결재 상신
- `GET /api/approvals/status/{taskType}/{taskId}`: 결재 상태 조회
- `POST /api/approvals/process`: 결재 처리
- `GET /api/approvals/my-pending/{userId}`: 내 결재 대기 목록
- `GET /api/approvals/summary/{userId}`: 결재 요약 정보

## 예제 페이지

`ExecutiveStatusPageWithApproval.tsx`에서 실제 통합 예제를 확인할 수 있습니다.