# 메인 대시보드 백엔드 API 요구사항

## 1. Controller 구현 필요

### MainDashboardController.java
```java
@RestController
@RequestMapping("/main")
@RequiredArgsConstructor
public class MainDashboardController {
    
    private final MainDashboardService mainDashboardService;
    
    @GetMapping("/stats/{userId}")
    public ResponseEntity<WorkStatsDto> getWorkStats(@PathVariable String userId) {
        // 사용자별 업무 통계 조회
    }
    
    @GetMapping("/workflows/{userId}")
    public ResponseEntity<List<WorkflowStatusDto>> getWorkflowStatus(@PathVariable String userId) {
        // 사용자별 워크플로우 현황 조회
    }
    
    @GetMapping("/trends/{userId}")
    public ResponseEntity<List<MonthlyTrendDto>> getMonthlyTrends(@PathVariable String userId) {
        // 월별 트렌드 데이터 조회
    }
    
    @GetMapping("/recent-tasks/{userId}")
    public ResponseEntity<List<RecentTaskDto>> getRecentTasks(@PathVariable String userId) {
        // 최근 완료 업무 조회
    }
}
```

## 2. DTO 클래스 구현 필요

### WorkStatsDto.java
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkStatsDto {
    private Integer totalTasks;        // 총 업무 수
    private Integer completedTasks;    // 완료 업무 수
    private Integer pendingTasks;      // 대기 업무 수
    private Integer overdueTasks;      // 지연 업무 수
    private Integer approvalPending;   // 결재 대기 수
    private Integer auditTasks;        // 점검 업무 수
}
```

### WorkflowStatusDto.java
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStatusDto {
    private String processId;
    private String processName;
    private String description;
    private String category;
    private Integer currentStep;
    private Integer progress;
    private List<WorkflowStepDto> steps;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStepDto {
    private String id;
    private String title;
    private String description;
    private String status; // completed, active, pending, error
    private String assignee;
    private String dueDate;
    private String estimatedTime;
}
```

### MonthlyTrendDto.java
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendDto {
    private String month;
    private Integer completed;
    private Integer pending;
    private Integer total;
}
```

### RecentTaskDto.java
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentTaskDto {
    private String taskName;
    private String completedAt;
    private String category;
}
```

## 3. Service 구현 필요

### MainDashboardService.java / MainDashboardServiceImpl.java
```java
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MainDashboardServiceImpl implements MainDashboardService {
    
    // 필요한 Repository 주입
    private final ApprovalRepository approvalRepository;
    private final AuditRepository auditRepository;
    // ... 기타 Repository들
    
    @Override
    public WorkStatsDto getWorkStats(String userId) {
        // 1. 결재 대기 건수 조회 (approval 테이블)
        Integer approvalPending = approvalRepository.countPendingByUserId(userId);
        
        // 2. 점검 업무 조회 (audit 관련 테이블들)
        Integer auditTasks = auditRepository.countTasksByUserId(userId);
        
        // 3. 기타 업무 통계 계산
        // ... 실제 비즈니스 로직 구현
        
        return WorkStatsDto.builder()
            .totalTasks(totalTasks)
            .completedTasks(completedTasks)
            .pendingTasks(pendingTasks)
            .overdueTasks(overdueTasks)
            .approvalPending(approvalPending)
            .auditTasks(auditTasks)
            .build();
    }
    
    // ... 다른 메서드들 구현
}
```

## 4. 데이터베이스 쿼리 최적화

### 현재 활용 가능한 테이블들
1. **approval** 테이블 - 결재 현황 데이터
2. **audit_prog_mngt** 테이블 - 점검 계획 데이터
3. **hod_ic_item** 테이블 - 부서장 내부통제 항목
4. **responsibility_documents** 테이블 - 책무기술서 관리
5. **users, employee, departments** 테이블 - 사용자/부서 정보

### 필요한 Repository 메서드들
```java
// ApprovalRepository에 추가
@Query("SELECT COUNT(a) FROM Approval a WHERE a.assigneeId = :userId AND a.status = 'PENDING'")
Integer countPendingByUserId(@Param("userId") String userId);

// AuditRepository에 추가
@Query("SELECT COUNT(a) FROM AuditProgMngt a WHERE a.assigneeId = :userId")
Integer countTasksByUserId(@Param("userId") String userId);

// 월별 트렌드 쿼리 예시
@Query("SELECT new org.itcen.domain.main.dto.MonthlyTrendDto(" +
       "FUNCTION('DATE_FORMAT', a.createdAt, '%Y-%m') as month, " +
       "COUNT(CASE WHEN a.status = 'COMPLETED' THEN 1 END) as completed, " +
       "COUNT(CASE WHEN a.status = 'PENDING' THEN 1 END) as pending, " +
       "COUNT(a) as total) " +
       "FROM Approval a WHERE a.assigneeId = :userId " +
       "GROUP BY FUNCTION('DATE_FORMAT', a.createdAt, '%Y-%m') " +
       "ORDER BY month DESC")
List<MonthlyTrendDto> getMonthlyTrendsByUserId(@Param("userId") String userId);
```

## 5. 구현 순서

1. **DTO 클래스 생성** (가장 간단, 타입 정의)
2. **Repository 메서드 추가** (데이터 접근 로직)
3. **Service 구현** (비즈니스 로직)
4. **Controller 구현** (API 엔드포인트)
5. **테스트 및 디버깅**

## 6. 현재 프론트엔드 상태

- ✅ API 클라이언트 구조 완성 (`mainDashboardApi.ts`)
- ✅ 실제 결재 API 연동 완료 (일부)
- ✅ 에러 핸들링 및 폴백 로직 구현
- 🔄 백엔드 API 구현 대기 중

## 7. 즉시 확인 가능한 실제 데이터

현재 **결재 대기 건수**는 실제 데이터로 표시됩니다:
- `approvalApi.getMyPendingApprovals(userId)` 호출
- 실제 데이터베이스에서 해당 사용자의 결재 대기 건수를 가져옴
- API 실패 시 목업 데이터로 폴백

## 6. 워크플로우 프로세스 관리 API 추가 요구사항

### 새로운 Controller 메서드 추가

#### MainDashboardController.java에 추가
```java
@GetMapping("/workflow-processes/{userId}")
public ResponseEntity<List<UserWorkflowProcessStatusDto>> getUserWorkflowProcesses(@PathVariable String userId) {
    // 사용자별 전체 워크플로우 프로세스 현황 조회
}

@GetMapping("/approval-process/{userId}")
public ResponseEntity<UserWorkflowProcessStatusDto> getApprovalProcessStatus(@PathVariable String userId) {
    // 결재 프로세스 현황 조회 (approval 테이블, ORDER_STATUS 코드그룹)
}

@GetMapping("/audit-process/{userId}")
public ResponseEntity<UserWorkflowProcessStatusDto> getAuditProcessStatus(@PathVariable String userId) {
    // 이행점검 프로세스 현황 조회 (audit_prog_mngt_detail 테이블, PLAN_IMP 코드그룹)
}

@GetMapping("/management-process/{userId}")
public ResponseEntity<UserWorkflowProcessStatusDto> getManagementProcessStatus(@PathVariable String userId) {
    // 원장관리 프로세스 현황 조회 (ledger_orders 테이블, ORDER_STATUS 코드그룹)
}
```

### 새로운 DTO 클래스

#### UserWorkflowProcessStatusDto.java
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserWorkflowProcessStatusDto {
    private String processType;          // 'approval', 'audit', 'management'
    private String processName;          // 프로세스명
    private Integer currentStep;         // 현재 단계 (0부터 시작)
    private Integer totalSteps;          // 전체 단계 수
    private Integer progress;            // 진행률 (0-100%)
    private String activeStepTitle;      // 현재 활성 단계 제목
    private String activeStepDescription;// 현재 활성 단계 설명
    private String assignee;             // 현재 담당자
    private String dueDate;              // 마감일 (선택적)
    private String estimatedTime;        // 예상 소요시간 (선택적)
    private List<WorkflowStepDto> steps; // 전체 단계 정보
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStepDto {
    private String title;                // 단계 제목
    private String description;          // 단계 설명
    private String status;               // 'completed', 'active', 'pending', 'error'
    private String assignee;             // 담당자 (선택적)
    private String dueDate;              // 마감일 (선택적)
    private String estimatedTime;        // 예상 소요시간 (선택적)
}
```

### 비즈니스 로직 구현 가이드

#### 1. 결재 프로세스 (Approval Process)
```java
// ApprovalService 또는 새로운 WorkflowService에서 구현
public UserWorkflowProcessStatusDto getApprovalProcessStatus(String userId) {
    // 1. approval 테이블에서 사용자의 현재 결재 건 조회
    // 2. ORDER_STATUS 코드그룹에서 상태 매핑
    // 3. 현재 단계 및 진행률 계산
    // 4. DTO 변환 후 반환
    
    // 예시 쿼리:
    // SELECT a.*, cc.code_nm FROM approval a 
    // JOIN common_code cc ON a.appr_stat_cd = cc.code_val 
    // WHERE cc.group_code = 'ORDER_STATUS' AND a.requester_id = ?
}
```

#### 2. 이행점검 프로세스 (Audit Process)
```java
public UserWorkflowProcessStatusDto getAuditProcessStatus(String userId) {
    // 1. audit_prog_mngt_detail 테이블에서 INS03(미흡) 항목 조회
    // 2. imp_pl_status_cd로 현재 단계 파악 (PLAN_IMP 코드그룹)
    // 3. 6단계 프로세스 매핑: 계획작성→계획결재요청→계획결재완료→이행작성→이행결재요청→이행결재완료
    
    // 예시 쿼리:
    // SELECT apd.*, cc.code_nm FROM audit_prog_mngt_detail apd
    // JOIN common_code cc ON apd.imp_pl_status_cd = cc.code_val
    // WHERE cc.group_code = 'PLAN_IMP' AND apd.inspect_result_cd = 'INS03'
    // AND apd.assignee_id = ?
}
```

#### 3. 원장관리 프로세스 (Management Process)
```java
public UserWorkflowProcessStatusDto getManagementProcessStatus(String userId) {
    // 1. ledger_orders 테이블에서 사용자 관련 원장 조회
    // 2. ledger_orders_status_cd로 현재 단계 파악 (ORDER_STATUS 코드그룹)
    // 3. 5단계 프로세스 매핑: 신규→직책확정→직책별책무확정→임원확정→최종확정
    
    // 예시 쿼리:
    // SELECT lo.*, cc.code_nm FROM ledger_orders lo
    // JOIN common_code cc ON lo.ledger_orders_status_cd = cc.code_val
    // WHERE cc.group_code = 'ORDER_STATUS' AND lo.assignee_id = ?
}
```

### 코드그룹 매핑 정보

#### ORDER_STATUS (결재 프로세스, 원장관리 프로세스)
- 상신 → 진행중 → 승인/반려 (결재)
- 신규 → 직책확정 → 직책별책무확정 → 임원확정 → 최종확정 (원장관리)

#### PLAN_IMP (이행점검 프로세스)
- 계획작성 → 계획결재요청 → 계획결재완료 → 이행작성 → 이행결재요청 → 이행결재완료

### 구현 우선순위
1. **UserWorkflowProcessStatusDto 및 WorkflowStepDto 생성**
2. **MainDashboardController에 새 엔드포인트 추가**
3. **각 프로세스별 Service 메서드 구현**
4. **Common Code 테이블 연동 쿼리 작성**
5. **실제 데이터 기반 단계 계산 로직 구현**

백엔드 API가 구현되면 주석 처리된 부분을 활성화하여 완전한 실제 데이터 연동이 가능합니다.