/**
 * 점검 현황(부서별) 페이지
 * 적부구조도 이력 점검의 부서별 점검 현황 관리 페이지
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { ComboBox } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn, SelectOption } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Box, Chip } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

interface IDeptStatusPageProps {
  className?: string;
}

interface DeptStatusRow {
  id: number;
  department: string;        // 부서명
  totalItems: number;        // 총 항목 수
  completedItems: number;    // 완료 항목 수
  completionRate: number;    // 완료율
  status: string;           // 상태
  lastInspectionDate: string; // 최종 점검일
}

const DeptStatusPage: React.FC<IDeptStatusPageProps> = () => {
  // 상태 관리
  const [selectedRound, setSelectedRound] = useState<SelectOption | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<SelectOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 옵션 데이터
  const roundOptions: SelectOption[] = [
    { value: '2024-001', label: '2024년 1차 점검' },
    { value: '2024-002', label: '2024년 2차 점검' },
  ];

  const departmentOptions: SelectOption[] = [
    { value: 'all', label: '전체' },
    { value: 'risk', label: '리스크관리부' },
    { value: 'compliance', label: '준법지원부' },
    { value: 'internal', label: '내부통제부' },
  ];

  // 테이블 컬럼 정의
  const columns: DataGridColumn<DeptStatusRow>[] = [
    {
      field: 'department',
      headerName: '부서명',
      flex: 1,
      minWidth: 150,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'totalItems',
      headerName: '총 항목 수',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => `${value}개`
    },
    {
      field: 'completedItems',
      headerName: '완료 항목 수',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => `${value}개`
    },
    {
      field: 'completionRate',
      headerName: '완료율',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => `${value}%`
    },
    {
      field: 'status',
      headerName: '상태',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => {
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

        switch (value) {
          case '진행중':
            color = 'warning';
            break;
          case '완료':
            color = 'success';
            break;
          case '미시작':
            color = 'error';
            break;
          default:
            color = 'default';
        }

        return (
          <Chip
            label={value}
            color={color}
            size="small"
          />
        );
      }
    },
    {
      field: 'lastInspectionDate',
      headerName: '최종 점검일',
      flex: 1,
      minWidth: 150,
      align: 'center',
      headerAlign: 'center',
    },
  ];

  // 임시 데이터
  const [rows, setRows] = useState<DeptStatusRow[]>([
    {
      id: 1,
      department: '리스크관리부',
      totalItems: 25,
      completedItems: 20,
      completionRate: 80,
      status: '진행중',
      lastInspectionDate: '2024-03-15'
    },
    {
      id: 2,
      department: '준법지원부',
      totalItems: 30,
      completedItems: 30,
      completionRate: 100,
      status: '완료',
      lastInspectionDate: '2024-03-20'
    },
    {
      id: 3,
      department: '내부통제부',
      totalItems: 28,
      completedItems: 0,
      completionRate: 0,
      status: '미시작',
      lastInspectionDate: '-'
    },
  ]);

  // 데이터 조회
  const fetchDeptStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: API 호출 구현
      console.log('조회 조건:', { selectedRound, selectedDepartment });
    } catch (err) {
      console.error('데이터 조회 실패:', err);
      setErrorMessage('데이터 조회에 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRound, selectedDepartment]);

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
          <ComboBox
            value={selectedRound}
            onChange={(value) => setSelectedRound(value as SelectOption)}
            options={roundOptions}
            placeholder="점검 회차 선택"
            size="small"
            sx={{ minWidth: '200px' }}
          />
          <ComboBox
            value={selectedDepartment}
            onChange={(value) => setSelectedDepartment(value as SelectOption)}
            options={departmentOptions}
            placeholder="부서 선택"
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

        {/* 데이터 그리드 */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <DataGrid
            data={rows}
            columns={columns}
            loading={isLoading}
            error={null}
          />
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
