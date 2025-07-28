/**
 * 점검 현황(부서별) 페이지
 * 적부구조도 이력 점검의 부서별 점검 현황 관리 페이지
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { Button } from '@/shared/components/ui/button';
import { ComboBox } from '@/shared/components/ui/form';
import DepartmentSelect from '@/shared/components/ui/form/DepartmentSelect';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { SelectOption } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { 
  Box, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { hodICItemApi, type HodICItemRow } from '@/domains/ledgermngt/api/hodIcItemApi';
import { DepartmentApi, type Department } from '@/domains/common/api/departmentApi';

interface IDeptStatusPageProps {
  className?: string;
}

interface DeptStatusRow {
  id: number;
  department: string;        // 부서명
  
  // 점검 결과
  totalItems: number;        // 전체
  appropriateItems: number;  // 적정
  deficientItems: number;    // 미흡
  excludedItems: number;     // 점검제외
  appropriateRate: number;   // 적정 수행률(%)
  
  // 개선계획 등록 현황
  deficientItemsForPlan: number;  // 미흡사항
  registeredPlans: number;        // 등록
  unregisteredPlans: number;      // 미등록
  registrationRate: number;       // 등록률(%)
}

const DeptStatusPage: React.FC<IDeptStatusPageProps> = () => {
  // 상태 관리
  const [selectedRound, setSelectedRound] = useState<SelectOption | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [rows, setRows] = useState<DeptStatusRow[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // 옵션 데이터
  const roundOptions: SelectOption[] = [
    { value: '2024-001', label: '2024년 1차 점검' },
    { value: '2024-002', label: '2024년 2차 점검' },
  ];
  /**
   * 부서 코드를 부서명으로 변환
   */
  const getDepartmentName = (deptCd: string): string => {
    const department = departments.find(dept => dept.departmentId === deptCd);
    return department ? department.departmentName : deptCd;
  };

  /**
   * 부서 목록 조회
   */
  const fetchDepartments = useCallback(async () => {
    try {
      const deptList = await DepartmentApi.getAll();
      setDepartments(deptList);
    } catch (err) {
      console.error('부서 목록 조회 실패:', err);
    }
  }, []);

  /**
   * hod_ic_item 데이터를 부서별로 그룹화하여 통계 계산
   */
  const processHodICItemData = (items: HodICItemRow[]): DeptStatusRow[] => {
    // 부서별로 그룹화
    const groupedByDept = items.reduce((acc, item) => {
      const deptCd = item.deptCd || '미분류';
      if (!acc[deptCd]) {
        acc[deptCd] = [];
      }
      acc[deptCd].push(item);
      return acc;
    }, {} as Record<string, HodICItemRow[]>);

    // 각 부서별 통계 계산
    const deptRows = Object.entries(groupedByDept).map(([deptCd, items], index) => {
      const totalItems = items.length;
      
      // 실제 점검 결과 통계 계산
      let appropriateItems = 0;
      let deficientItems = 0;
      let excludedItems = 0;
      
      items.forEach(item => {
        const statusCd = item.auditResultStatusCd;
        if (statusCd === '적정') {
          appropriateItems++;
        } else if (statusCd === '미흡') {
          deficientItems++;
        } else if (statusCd === '제외') {
          excludedItems++;
        } else {
          // 공란이거나 기타 상태는 미흡으로 처리
          deficientItems++;
        }
      });
      
      const appropriateRate = totalItems > 0 ? Math.round((appropriateItems / totalItems) * 100) : 0;
      
      // 개선계획 등록 현황 통계 (임시 로직)
      const deficientItemsForPlan = deficientItems;
      const registeredPlans = Math.floor(deficientItemsForPlan * 0.7); // 70% 등록
      const unregisteredPlans = deficientItemsForPlan - registeredPlans;
      const registrationRate = deficientItemsForPlan > 0 ? Math.round((registeredPlans / deficientItemsForPlan) * 100) : 0;

      return {
        id: index + 1,
        department: getDepartmentName(deptCd), // 부서명으로 변환
        totalItems,
        appropriateItems,
        deficientItems,
        excludedItems,
        appropriateRate,
        deficientItemsForPlan,
        registeredPlans,
        unregisteredPlans,
        registrationRate
      };
    });

    // 합계 행 계산
    if (deptRows.length > 0) {
      const totals = deptRows.reduce((acc, row) => {
        acc.totalItems += row.totalItems;
        acc.appropriateItems += row.appropriateItems;
        acc.deficientItems += row.deficientItems;
        acc.excludedItems += row.excludedItems;
        acc.deficientItemsForPlan += row.deficientItemsForPlan;
        acc.registeredPlans += row.registeredPlans;
        acc.unregisteredPlans += row.unregisteredPlans;
        return acc;
      }, {
        totalItems: 0,
        appropriateItems: 0,
        deficientItems: 0,
        excludedItems: 0,
        deficientItemsForPlan: 0,
        registeredPlans: 0,
        unregisteredPlans: 0
      });

      // 전체 적정 수행률 계산
      const totalAppropriateRate = totals.totalItems > 0 
        ? Math.round((totals.appropriateItems / totals.totalItems) * 100) 
        : 0;

      // 전체 등록률 계산
      const totalRegistrationRate = totals.deficientItemsForPlan > 0 
        ? Math.round((totals.registeredPlans / totals.deficientItemsForPlan) * 100) 
        : 0;

      const totalRow: DeptStatusRow = {
        id: deptRows.length + 1,
        department: '합계',
        totalItems: totals.totalItems,
        appropriateItems: totals.appropriateItems,
        deficientItems: totals.deficientItems,
        excludedItems: totals.excludedItems,
        appropriateRate: totalAppropriateRate,
        deficientItemsForPlan: totals.deficientItemsForPlan,
        registeredPlans: totals.registeredPlans,
        unregisteredPlans: totals.unregisteredPlans,
        registrationRate: totalRegistrationRate
      };

      return [...deptRows, totalRow];
    }

    return deptRows;
  };

  // 부서 목록 조회
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // 데이터 조회
  const fetchDeptStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // hod_ic_item 데이터 조회
      const hodICItems = await hodICItemApi.getHodICItemStatusList(
        selectedRound?.value as string,
        selectedDepartment?.value as string
      );
      
      // departments 데이터가 로드된 후에만 처리
      if (departments.length > 0) {
        // 데이터 처리 및 통계 계산
        const processedData = processHodICItemData(hodICItems);
        setRows(processedData);
      }
      
    } catch (err) {
      console.error('데이터 조회 실패:', err);
      setErrorMessage('데이터 조회에 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRound, selectedDepartment, departments]);

  useEffect(() => {
    fetchDeptStatus();
  }, [fetchDeptStatus]);

  const handleErrorDialogClose = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

  return (
    <PageContainer>
      <PageHeader
        title="[1100] 점검 현황(부서별)"
        icon={<GroupsIcon />}
        description="점검 현황을 부서별로 조회합니다."
        elevation={false}
      />
      <PageContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
          position: 'relative',
          py: 1,
        }}
      >
        {/* 필터 영역 */}
        <Box sx={{
          display: 'flex',
          gap: '8px',
          padding: '8px 16px',
          mb: 2,
          bgcolor: 'var(--bank-bg-secondary)',
          borderRadius: 1,
          border: '1px solid var(--bank-border)',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>점검회차</span>
          <ComboBox
            value={selectedRound}
            onChange={(value) => setSelectedRound(value as SelectOption)}
            options={roundOptions}
            size="small"
            sx={{ minWidth: '200px' }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>부서</span>
          <DepartmentSelect
            value={selectedDepartment}
            onChange={(value) => setSelectedDepartment(value)}
            size="small"
            sx={{ minWidth: '200px' }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={fetchDeptStatus}
            color="primary"
          >
            조회
          </Button>
        </Box>

        {/* 계층적 헤더 테이블 */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
            <Table stickyHeader size="small">
              <TableHead>
                {/* 첫 번째 행: 메인 헤더 */}
                <TableRow>
                  <TableCell 
                    rowSpan={2} 
                    align="center" 
                    sx={{ 
                      backgroundColor: '#f5f5f5', 
                      fontWeight: 'bold',
                      border: '1px solid #ddd',
                      minWidth: 120
                    }}
                  >
                    부서
                  </TableCell>
                  <TableCell 
                    colSpan={5} 
                    align="center" 
                    sx={{ 
                      backgroundColor: '#e3f2fd', 
                      fontWeight: 'bold',
                      border: '1px solid #ddd'
                    }}
                  >
                    점검 결과
                  </TableCell>
                  <TableCell 
                    colSpan={4} 
                    align="center" 
                    sx={{ 
                      backgroundColor: '#e8f5e8', 
                      fontWeight: 'bold',
                      border: '1px solid #ddd'
                    }}
                  >
                    개선계획 등록 현황
                  </TableCell>
                </TableRow>
                
                {/* 두 번째 행: 서브 헤더 */}
                <TableRow>
                  <TableCell align="center" sx={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
                    전체
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
                    적정
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
                    미흡
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
                    점검제외
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
                    적정 수행률(%)
                  </TableCell>
                  <TableCell 
                    align="center" 
                    sx={{ 
                      backgroundColor: '#f5f5f5', 
                      border: '1px solid #ddd'
                    }}
                  >
                    미흡사항
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
                    등록
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
                    미등록
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
                    등록률(%)
                  </TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {rows.map((row) => (
                  <TableRow 
                    key={row.id} 
                    hover
                    sx={row.department === '합계' ? {
                      backgroundColor: '#f0f8ff',
                      fontWeight: 'bold',
                      '& td': {
                        borderTop: '2px solid #1976d2',
                        fontWeight: 'bold'
                      }
                    } : {}}
                  >
                    <TableCell 
                      align="center" 
                      sx={{ 
                        fontWeight: 'bold',
                        border: '1px solid #ddd',
                        backgroundColor: row.department === '합계' ? '#e3f2fd' : '#fafafa'
                      }}
                    >
                      {row.department}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #ddd' }}>
                      {row.totalItems}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #ddd' }}>
                      {row.appropriateItems}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #ddd' }}>
                      {row.deficientItems}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #ddd' }}>
                      {row.excludedItems}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #ddd' }}>
                      {row.appropriateRate}%
                    </TableCell>
                    <TableCell 
                      align="center" 
                      sx={{ 
                        border: '1px solid #ddd'
                      }}
                    >
                      {row.deficientItemsForPlan}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #ddd' }}>
                      {row.registeredPlans}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #ddd' }}>
                      {row.unregisteredPlans}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #ddd' }}>
                      {row.registrationRate}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* 에러 다이얼로그 */}
        <ErrorDialog
          open={errorDialogOpen}
          errorMessage={errorMessage}
          onClose={handleErrorDialogClose}
        />
      </PageContent>
    </PageContainer>
  );
};

export default DeptStatusPage;
