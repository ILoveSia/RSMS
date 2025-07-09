/**
 * 공통 팝업 사용 예시 페이지
 * 부서검색 팝업과 사원검색 팝업의 사용법을 보여줍니다.
 */
import DepartmentSearchPopup from '@/app/components/DepartmentSearchPopup';
import type { Department, EmployeeSearchResult } from '@/domains/common/components/search';
import { EmployeeSearchPopup } from '@/domains/common/components/search';
import { Box, Button, Chip, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

const PopupExamplePage: React.FC = () => {
  // 부서검색 팝업 상태
  const [deptPopupOpen, setDeptPopupOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);

  // 사원검색 팝업 상태
  const [empPopupOpen, setEmpPopupOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSearchResult | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeSearchResult[]>([]);

  // 부서검색 핸들러들
  const handleDeptSelect = (department: Department | Department[]) => {
    if (Array.isArray(department)) {
      setSelectedDepartments(department);
    } else {
      setSelectedDepartment(department);
    }
  };

  // 사원검색 핸들러들
  const handleEmpSelect = (employee: EmployeeSearchResult) => {
    setSelectedEmployee(employee);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        공통 팝업 사용 예시
      </Typography>

      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        부서검색 팝업과 사원검색 팝업의 사용법을 보여주는 예시 페이지입니다.
      </Typography>

      <Grid container spacing={3}>
        {/* 부서검색 팝업 예시 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
              부서검색 팝업
            </Typography>

            <Stack spacing={2}>
              {/* 단일 선택 */}
              <Box>
                <Typography variant='subtitle2' gutterBottom>
                  단일 선택
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  <TextField
                    size='small'
                    placeholder='부서를 선택하세요'
                    value={
                      selectedDepartment
                        ? `${selectedDepartment.deptName} (${selectedDepartment.deptCode})`
                        : ''
                    }
                    InputProps={{ readOnly: true }}
                    sx={{ flex: 1 }}
                  />
                  <Button variant='outlined' onClick={() => setDeptPopupOpen(true)}>
                    검색
                  </Button>
                </Box>
                {selectedDepartment && (
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      선택된 부서:
                    </Typography>
                    <Chip
                      label={`${selectedDepartment.deptName} (${selectedDepartment.deptCode})`}
                      onDelete={() => setSelectedDepartment(null)}
                      size='small'
                      sx={{ ml: 1 }}
                    />
                  </Box>
                )}
              </Box>

              {/* 다중 선택 */}
              <Box>
                <Typography variant='subtitle2' gutterBottom>
                  다중 선택
                </Typography>
                <Button variant='outlined' onClick={() => setDeptPopupOpen(true)} fullWidth>
                  부서 다중 선택 ({selectedDepartments.length}개 선택됨)
                </Button>
                {selectedDepartments.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      선택된 부서들:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {selectedDepartments.map(dept => (
                        <Chip
                          key={dept.id}
                          label={`${dept.deptName} (${dept.deptCode})`}
                          onDelete={() => {
                            setSelectedDepartments(prev => prev.filter(d => d.id !== dept.id));
                          }}
                          size='small'
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* 사원검색 팝업 예시 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
              사원검색 팝업
            </Typography>

            <Stack spacing={2}>
              {/* 단일 선택 */}
              <Box>
                <Typography variant='subtitle2' gutterBottom>
                  단일 선택
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  <TextField
                    size='small'
                    placeholder='사원을 선택하세요'
                    value={
                      selectedEmployee
                        ? `${selectedEmployee.username} (${selectedEmployee.num})`
                        : ''
                    }
                    InputProps={{ readOnly: true }}
                    sx={{ flex: 1 }}
                  />
                  <Button variant='outlined' onClick={() => setEmpPopupOpen(true)}>
                    검색
                  </Button>
                </Box>
                {selectedEmployee && (
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      선택된 사원:
                    </Typography>
                    <Chip
                      label={`${selectedEmployee.username} (${selectedEmployee.num})`}
                      onDelete={() => setSelectedEmployee(null)}
                      size='small'
                      sx={{ ml: 1 }}
                    />
                  </Box>
                )}
              </Box>

              {/* 다중 선택 */}
              <Box>
                <Typography variant='subtitle2' gutterBottom>
                  다중 선택
                </Typography>
                <Button variant='outlined' onClick={() => setEmpPopupOpen(true)} fullWidth>
                  사원 다중 선택 ({selectedEmployees.length}명 선택됨)
                </Button>
                {selectedEmployees.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      선택된 사원들:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {selectedEmployees.map(emp => (
                        <Chip
                          key={emp.id}
                          label={`${emp.username} (${emp.num})`}
                          onDelete={() => {
                            setSelectedEmployees(prev => prev.filter(e => e.id !== emp.id));
                          }}
                          size='small'
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* 사용법 안내 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant='h6' gutterBottom>
          사용법 안내
        </Typography>
        <Typography variant='body2' component='div'>
          <strong>부서검색 팝업 (DepartmentSearchPopup)</strong>
          <ul>
            <li>단일/다중 선택 지원</li>
            <li>부서코드, 부서명, 부서장명으로 검색</li>
            <li>계층 구조 표시 (들여쓰기)</li>
            <li>더블클릭으로 빠른 선택</li>
          </ul>

          <strong>사원검색 팝업 (EmployeeSearchPopup)</strong>
          <ul>
            <li>단일/다중 선택 지원</li>
            <li>사번, 사원명, 부서명, 이메일로 검색</li>
            <li>재직상태 필터링 (재직/휴직/퇴사)</li>
            <li>특정 부서로 필터링 가능</li>
            <li>더블클릭으로 빠른 선택</li>
          </ul>
        </Typography>
      </Paper>

      {/* 부서검색 팝업 */}
      <DepartmentSearchPopup
        open={deptPopupOpen}
        onClose={() => setDeptPopupOpen(false)}
        onSelect={handleDeptSelect}
      />

      {/* 사원검색 팝업 */}
      <EmployeeSearchPopup
        open={empPopupOpen}
        onClose={() => setEmpPopupOpen(false)}
        onSelect={handleEmpSelect}
      />
    </Box>
  );
};

export default PopupExamplePage;
