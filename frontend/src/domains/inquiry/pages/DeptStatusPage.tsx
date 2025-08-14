/**
 * 점검 현황(부서별) 페이지
 * 적부구조도 이력 점검의 부서별 점검 현황 관리 페이지
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { Button } from '@/shared/components/ui/button';
import SearchButton from '@/shared/components/ui/button/SearchButton';
import { ComboBox, SearchConditionPanel } from '@/shared/components/ui/form';
import DepartmentSearchBox from '@/shared/components/ui/form/DepartmentSearchBox';
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
import type { Department as SearchPopupDepartment } from '@/domains/common/components/search/DepartmentSearchPopup';

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
  
  // 프론트엔드 필터링을 위한 상태
  const [allHodICItems, setAllHodICItems] = useState<HodICItemRow[]>([]);
  const [filteredHodICItems, setFilteredHodICItems] = useState<HodICItemRow[]>([]);

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
   * 부서별로 아이템들을 그룹화
   */
  const groupItemsByDepartment = (items: HodICItemRow[]): Record<string, HodICItemRow[]> => {
    return items.reduce((acc, item) => {
      const deptCd = item.deptCd || '미분류';
      if (!acc[deptCd]) {
        acc[deptCd] = [];
      }
      acc[deptCd].push(item);
      return acc;
    }, {} as Record<string, HodICItemRow[]>);
  };

  /**
   * 점검 결과 통계 계산
   */
  const calculateAuditStats = (items: HodICItemRow[]) => {
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
    
    return { appropriateItems, deficientItems, excludedItems };
  };

  /**
   * 개선계획 등록 현황 통계 계산
   */
  const calculatePlanStats = (deficientItems: number) => {
    const deficientItemsForPlan = deficientItems;
    const registeredPlans = Math.floor(deficientItemsForPlan * 0.7); // 70% 등록
    const unregisteredPlans = deficientItemsForPlan - registeredPlans;
    const registrationRate = deficientItemsForPlan > 0 
      ? Math.round((registeredPlans / deficientItemsForPlan) * 100) 
      : 0;
    
    return { deficientItemsForPlan, registeredPlans, unregisteredPlans, registrationRate };
  };

  /**
   * 부서별 통계 계산
   */
  const calculateDepartmentStats = (deptCd: string, items: HodICItemRow[], index: number): DeptStatusRow => {
    const totalItems = items.length;
    const { appropriateItems, deficientItems, excludedItems } = calculateAuditStats(items);
    const { deficientItemsForPlan, registeredPlans, unregisteredPlans, registrationRate } = calculatePlanStats(deficientItems);
    
    const appropriateRate = totalItems > 0 
      ? Math.round((appropriateItems / totalItems) * 100) 
      : 0;

    return {
      id: index + 1,
      department: getDepartmentName(deptCd),
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
  };

  /**
   * 합계 행 계산
   */
  const calculateTotalRow = (deptRows: DeptStatusRow[]): DeptStatusRow | null => {
    if (deptRows.length === 0) return null;
    
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

    const totalAppropriateRate = totals.totalItems > 0 
      ? Math.round((totals.appropriateItems / totals.totalItems) * 100) 
      : 0;

    const totalRegistrationRate = totals.deficientItemsForPlan > 0 
      ? Math.round((totals.registeredPlans / totals.deficientItemsForPlan) * 100) 
      : 0;

    return {
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
  };

  /**
   * hod_ic_item 데이터를 부서별로 그룹화하여 통계 계산
   */
  const processHodICItemData = (items: HodICItemRow[]): DeptStatusRow[] => {
    const groupedByDept = groupItemsByDepartment(items);
    
    const deptRows = Object.entries(groupedByDept).map(([deptCd, items], index) => 
      calculateDepartmentStats(deptCd, items, index)
    );

    const totalRow = calculateTotalRow(deptRows);
    
    return totalRow ? [...deptRows, totalRow] : deptRows;
  };

  // 부서 목록 조회
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // 초기 데이터 로드 (한 번만)
  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 모든 hod_ic_item 데이터 조회 (필터 없이)
      const allItems = await hodICItemApi.getHodICItemStatusList(
        selectedRound?.value ? Number(selectedRound.value) : undefined,
        undefined // 부서 필터 없이 모든 데이터
      );
      
      setAllHodICItems(allItems);
      
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setErrorMessage('데이터 로드에 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRound]);

  // 프론트엔드 필터링 함수
  const applyFilters = useCallback(() => {
    let filtered = allHodICItems;
    
    // 부서 필터링
    if (selectedDepartment?.deptCode) {
      filtered = filtered.filter(item => item.deptCd === selectedDepartment.deptCode);
    }
    
    setFilteredHodICItems(filtered);
    
    // departments 데이터가 로드된 후에만 처리
    if (departments.length > 0) {
      // 데이터 처리 및 통계 계산
      const processedData = processHodICItemData(filtered);
      setRows(processedData);
    }
  }, [allHodICItems, selectedRound, selectedDepartment, departments]);

  // 그리드에 있는 부서 목록 추출 (allHodICItems 사용)
  const getAvailableDepartments = useCallback((): SearchPopupDepartment[] => {
    if (allHodICItems.length === 0) {
      return [];
    }
    
    // 부서별로 그룹화하여 실제 부서만 추출
    const deptGroups = allHodICItems.reduce((acc, item) => {
      const deptCd = item.deptCd || '미분류';
      if (!acc[deptCd]) {
        acc[deptCd] = [];
      }
      acc[deptCd].push(item);
      return acc;
    }, {} as Record<string, HodICItemRow[]>);
    
    return Object.keys(deptGroups).map(deptCd => {
      const dept = departments.find(d => d.departmentId === deptCd);
      return {
        id: dept?.departmentId || '',
        deptCode: dept?.departmentId || '',
        deptName: dept?.departmentName || deptCd,
        useYn: 'Y',
        isActive: true,
        createdId: '',
        updatedId: '',
        createdAt: '',
        updatedAt: ''
      };
    });
  }, [allHodICItems, departments]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleErrorDialogClose = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

  // 통합된 클릭 이벤트 핸들러
  const handleCellClick = (type: string, row: DeptStatusRow) => {
    if (row.department === '합계') return;
    
    const handlers = {
      total: () => {},
      appropriate: () => {},
      deficient: () => {},
      excluded: () => {},
      deficientForPlan: () => {},
      registered: () => {},
      unregistered: () => {},
    } as const;
    
    handlers[type as keyof typeof handlers]?.();
  };

  // 클릭 가능한 셀 렌더링 헬퍼 함수
  const renderClickableCell = (
    value: string | number, 
    type: string, 
    row: DeptStatusRow,
    suffix: string = ''
  ) => (
    <TableCell 
      align="center" 
      onClick={() => handleCellClick(type, row)}
      sx={{ 
        border: '1px solid var(--bank-border)',
        cursor: row.department !== '합계' ? 'pointer' : 'default',
        '&:hover': row.department !== '합계' ? {
          backgroundColor: 'var(--bank-primary-bg)'
        } : {}
      }}
    >
      {value}{suffix}
    </TableCell>
  );

  // 일반 셀 렌더링 헬퍼 함수
  const renderNormalCell = (value: string | number, suffix: string = '') => (
    <TableCell align="center" sx={{ border: '1px solid var(--bank-border)' }}>
      {value}{suffix}
    </TableCell>
  );


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
        {/* 검색 조건 영역 */}
        <SearchConditionPanel disabled={isLoading}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', whiteSpace: 'nowrap' }}>점검회차</span>
            <ComboBox
              value={selectedRound}
              onChange={(value) => setSelectedRound(value as SelectOption)}
              options={roundOptions}
              size="small"
              mode="editable"
              disabled={isLoading}
              sx={{ minWidth: '200px' }}
            />
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px', whiteSpace: 'nowrap' }}>부서</span>
            <DepartmentSearchBox
              value={selectedDepartment}
              onChange={(value) => setSelectedDepartment(value)}
              size="small"
              disabled={isLoading}
              sx={{ minWidth: '200px' }}
              availableDepartments={getAvailableDepartments()}
            />
          </Box>
          <SearchButton
            onClick={applyFilters}
            loading={isLoading}
          />
        </SearchConditionPanel>

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
                      backgroundColor: 'var(--bank-bg-secondary)', 
                      fontWeight: 'bold',
                      border: '1px solid var(--bank-border)',
                      minWidth: 120
                    }}
                  >
                    부서
                  </TableCell>
                  <TableCell 
                    colSpan={5} 
                    align="center" 
                    sx={{ 
                      backgroundColor: 'var(--bank-bg-tertiary)', 
                      fontWeight: 'bold',
                      border: '1px solid var(--bank-border)'
                    }}
                  >
                    점검 결과
                  </TableCell>
                  <TableCell 
                    colSpan={4} 
                    align="center" 
                    sx={{ 
                      backgroundColor: 'var(--bank-bg-tertiary)', 
                      fontWeight: 'bold',
                      border: '1px solid var(--bank-border)'
                    }}
                  >
                    개선계획 등록 현황
                  </TableCell>
                </TableRow>
                
                {/* 두 번째 행: 서브 헤더 */}
                <TableRow>
                  <TableCell align="center" sx={{ backgroundColor: 'var(--bank-bg-secondary)', border: '1px solid var(--bank-border)' }}>
                    전체
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: 'var(--bank-bg-secondary)', border: '1px solid var(--bank-border)' }}>
                    적정
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: 'var(--bank-bg-secondary)', border: '1px solid var(--bank-border)' }}>
                    미흡
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: 'var(--bank-bg-secondary)', border: '1px solid var(--bank-border)' }}>
                    점검제외
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: 'var(--bank-bg-secondary)', border: '1px solid var(--bank-border)' }}>
                    적정 수행률(%)
                  </TableCell>
                  <TableCell 
                    align="center" 
                    sx={{ 
                      backgroundColor: 'var(--bank-bg-secondary)', 
                      border: '1px solid var(--bank-border)'
                    }}
                  >
                    미흡사항
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: 'var(--bank-bg-secondary)', border: '1px solid var(--bank-border)' }}>
                    등록
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: 'var(--bank-bg-secondary)', border: '1px solid var(--bank-border)' }}>
                    미등록
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: 'var(--bank-bg-secondary)', border: '1px solid var(--bank-border)' }}>
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
                      backgroundColor: 'var(--bank-primary-bg)',
                      fontWeight: 'bold',
                      '& td': {
                        borderTop: '2px solid var(--bank-primary)',
                        fontWeight: 'bold'
                      }
                    } : {}}
                  >
                    <TableCell 
                      align="center" 
                      sx={{ 
                        fontWeight: 'bold',
                        border: '1px solid var(--bank-border)',
                        backgroundColor: row.department === '합계' ? 'var(--bank-primary-bg)' : 'var(--bank-bg-secondary)'
                      }}
                    >
                      {row.department}
                    </TableCell>
                    {renderClickableCell(row.totalItems, 'total', row)}
                    {renderClickableCell(row.appropriateItems, 'appropriate', row)}
                    {renderClickableCell(row.deficientItems, 'deficient', row)}
                    {renderClickableCell(row.excludedItems, 'excluded', row)}
                    {renderNormalCell(row.appropriateRate + '%', '')}
                    {renderClickableCell(row.deficientItemsForPlan, 'deficientForPlan', row)}
                    {renderClickableCell(row.registeredPlans, 'registered', row)}
                    {renderClickableCell(row.unregisteredPlans, 'unregistered', row)}
                    {renderNormalCell(row.registrationRate + '%', '')}
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
