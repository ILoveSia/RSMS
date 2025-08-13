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

백엔드 API가 구현되면 주석 처리된 부분을 활성화하여 완전한 실제 데이터 연동이 가능합니다.