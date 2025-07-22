# 공통 팝업 사용법

여러 화면에서 공통으로 사용할 수 있는 부서검색 팝업과 사원검색 팝업의 사용법을 설명합니다.

## 1. 부서검색 팝업 (DepartmentSearchPopup)

### 기본 사용법

```tsx
import React, { useState } from 'react';
import { DepartmentSearchPopup, Department } from '@/components';

const MyComponent = () => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const handleSelect = (department: Department | Department[]) => {
    if (!Array.isArray(department)) {
      setSelectedDept(department);
      console.log('선택된 부서:', department);
    }
  };

  return (
    <>
      <Button onClick={() => setPopupOpen(true)}>
        부서 선택
      </Button>
      
      <DepartmentSearchPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        onSelect={handleSelect}
        title="부서검색"
        multiSelect={false}
      />
    </>
  );
};
```

### 다중 선택

```tsx
const [selectedDepts, setSelectedDepts] = useState<Department[]>([]);

const handleMultiSelect = (departments: Department | Department[]) => {
  if (Array.isArray(departments)) {
    setSelectedDepts(departments);
    console.log('선택된 부서들:', departments);
  }
};

<DepartmentSearchPopup
  open={popupOpen}
  onClose={() => setPopupOpen(false)}
  onSelect={handleMultiSelect}
  multiSelect={true}
  selectedDepartments={selectedDepts}
/>
```

### Props

| 속성 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| open | boolean | ✓ | - | 팝업 열림 상태 |
| onClose | () => void | ✓ | - | 팝업 닫기 핸들러 |
| onSelect | (departments: Department \| Department[]) => void | ✓ | - | 선택 완료 핸들러 |
| title | string | | '부서검색' | 팝업 제목 |
| multiSelect | boolean | | false | 다중 선택 여부 |
| selectedDepartments | Department[] | | [] | 기존 선택된 부서들 |

### Department 타입

```tsx
interface Department {
  id: number;
  deptCode: string;
  deptName: string;
  parentDeptCode?: string;
  parentDeptName?: string;
  deptLevel: number;
  sortOrder: number;
  managerName?: string;
  phoneNumber?: string;
  description?: string;
  isActive: boolean;
}
```

## 2. 사원검색 팝업 (EmployeeSearchPopup)

### 기본 사용법

```tsx
import React, { useState } from 'react';
import { EmployeeSearchPopup, Employee } from '@/components';

const MyComponent = () => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const handleSelect = (employee: Employee | Employee[]) => {
    if (!Array.isArray(employee)) {
      setSelectedEmp(employee);
      console.log('선택된 사원:', employee);
    }
  };

  return (
    <>
      <Button onClick={() => setPopupOpen(true)}>
        사원 선택
      </Button>
      
      <EmployeeSearchPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        onSelect={handleSelect}
        title="사원검색"
        multiSelect={false}
        filterStatus="ACTIVE" // 재직자만
      />
    </>
  );
};
```

### 특정 부서 사원만 검색

```tsx
<EmployeeSearchPopup
  open={popupOpen}
  onClose={() => setPopupOpen(false)}
  onSelect={handleSelect}
  filterDepartment="DEPT008" // 특정 부서 코드
  filterStatus="ACTIVE"
/>
```

### 다중 선택

```tsx
const [selectedEmps, setSelectedEmps] = useState<Employee[]>([]);

const handleMultiSelect = (employees: Employee | Employee[]) => {
  if (Array.isArray(employees)) {
    setSelectedEmps(employees);
    console.log('선택된 사원들:', employees);
  }
};

<EmployeeSearchPopup
  open={popupOpen}
  onClose={() => setPopupOpen(false)}
  onSelect={handleMultiSelect}
  multiSelect={true}
  selectedEmployees={selectedEmps}
/>
```

### Props

| 속성 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| open | boolean | ✓ | - | 팝업 열림 상태 |
| onClose | () => void | ✓ | - | 팝업 닫기 핸들러 |
| onSelect | (employees: Employee \| Employee[]) => void | ✓ | - | 선택 완료 핸들러 |
| title | string | | '사원검색' | 팝업 제목 |
| multiSelect | boolean | | false | 다중 선택 여부 |
| selectedEmployees | Employee[] | | [] | 기존 선택된 사원들 |
| filterDepartment | string | | undefined | 특정 부서로 필터링 |
| filterStatus | 'ACTIVE' \| 'INACTIVE' \| 'RESIGNED' \| 'ALL' | | 'ALL' | 상태 필터링 |

### Employee 타입

```tsx
interface Employee {
  id: number;
  empNo: string;
  empName: string;
  deptCode: string;
  deptName: string;
  positionCode: string;
  positionName: string;
  jobCode: string;
  jobName: string;
  email: string;
  phoneNumber?: string;
  mobileNumber?: string;
  hireDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'RESIGNED';
  statusName: string;
}
```

## 3. 실제 업무 화면에서의 사용 예시

### 회의체 등록 화면에서 담당부서 선택

```tsx
const MeetingBodyForm = () => {
  const [deptPopupOpen, setDeptPopupOpen] = useState(false);
  const [formData, setFormData] = useState({
    meetingName: '',
    deptCode: '',
    deptName: '',
    // ... 기타 필드
  });

  const handleDeptSelect = (department: Department | Department[]) => {
    if (!Array.isArray(department)) {
      setFormData(prev => ({
        ...prev,
        deptCode: department.deptCode,
        deptName: department.deptName,
      }));
    }
  };

  return (
    <form>
      <TextField
        label="담당부서"
        value={formData.deptName}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <Button onClick={() => setDeptPopupOpen(true)}>
              검색
            </Button>
          ),
        }}
      />
      
      <DepartmentSearchPopup
        open={deptPopupOpen}
        onClose={() => setDeptPopupOpen(false)}
        onSelect={handleDeptSelect}
      />
    </form>
  );
};
```

### 결재라인 설정에서 결재자 선택

```tsx
const ApprovalLineForm = () => {
  const [empPopupOpen, setEmpPopupOpen] = useState(false);
  const [approvers, setApprovers] = useState<Employee[]>([]);

  const handleEmpSelect = (employees: Employee | Employee[]) => {
    if (Array.isArray(employees)) {
      setApprovers(employees);
    }
  };

  return (
    <div>
      <Button onClick={() => setEmpPopupOpen(true)}>
        결재자 선택 ({approvers.length}명)
      </Button>
      
      {approvers.map((emp, index) => (
        <Chip
          key={emp.id}
          label={`${index + 1}. ${emp.empName} (${emp.positionName})`}
          onDelete={() => {
            setApprovers(prev => prev.filter((_, i) => i !== index));
          }}
        />
      ))}
      
      <EmployeeSearchPopup
        open={empPopupOpen}
        onClose={() => setEmpPopupOpen(false)}
        onSelect={handleEmpSelect}
        multiSelect={true}
        selectedEmployees={approvers}
        filterStatus="ACTIVE" // 재직자만
      />
    </div>
  );
};
```

## 4. 주요 기능

### 부서검색 팝업
- ✅ 단일/다중 선택 지원
- ✅ 부서코드, 부서명, 부서장명으로 검색
- ✅ 계층 구조 표시 (들여쓰기)
- ✅ 더블클릭으로 빠른 선택
- ✅ 실시간 검색 (300ms 디바운스)

### 사원검색 팝업
- ✅ 단일/다중 선택 지원
- ✅ 사번, 사원명, 부서명, 이메일로 검색
- ✅ 재직상태 필터링 (재직/휴직/퇴사)
- ✅ 특정 부서로 필터링 가능
- ✅ 더블클릭으로 빠른 선택
- ✅ 실시간 검색 (300ms 디바운스)

## 5. 주의사항

1. **타입 안전성**: TypeScript를 사용하여 타입 안전성을 보장합니다.
2. **성능**: 대량의 데이터를 처리할 수 있도록 가상화를 고려해야 할 수 있습니다.
3. **API 연동**: 현재는 더미 데이터를 사용하므로, 실제 API로 교체해야 합니다.
4. **접근성**: 키보드 네비게이션과 스크린 리더 지원을 고려했습니다.
5. **반응형**: 다양한 화면 크기에서 적절히 동작하도록 구현되었습니다.

## 6. API 연동 예시

실제 프로젝트에서는 더미 데이터 대신 API를 연동해야 합니다:

```tsx
// 부서 API 연동
const fetchDepartments = async () => {
  try {
    const response = await departmentApi.getAll();
    setDepartments(response.data);
  } catch (error) {
    setError('부서 목록을 불러오는데 실패했습니다.');
  }
};

// 사원 API 연동
const fetchEmployees = async () => {
  try {
    const params = {
      deptCode: filterDepartment,
      status: filterStatus,
    };
    const response = await employeeApi.getAll(params);
    setEmployees(response.data);
  } catch (error) {
    setError('사원 목록을 불러오는데 실패했습니다.');
  }
};
``` 