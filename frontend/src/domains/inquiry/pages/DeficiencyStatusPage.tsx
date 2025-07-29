/**
 * 미흡상황 현황 페이지 컴포넌트
 * 컴플라이언스 체크 - 미흡상황 현황 관리
 */
import '@/assets/scss/style.css';
import { Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { Modal } from '@/shared/components/ui/feedback';
import { ComboBox } from '@/shared/components/ui/form';
import DepartmentSelect, { type DepartmentSearchResult } from '@/shared/components/ui/form/DepartmentSelect';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import deficiencyStatusApi, { type DeficiencyStatusResponse } from '../api/deficiencyStatusApi';
import ImplementationResultDialog, { type ImplementationResultData } from '../components/ImplementationResultDialog';

interface IDeficiencyStatusPageProps {
  className?: string;
}

// 미흡상황 데이터 타입 정의 (API 응답 타입 사용)
type DeficiencyRow = DeficiencyStatusResponse;

const DeficiencyStatusPage: React.FC<IDeficiencyStatusPageProps> = (): React.JSX.Element => {
  const [rows, setRows] = useState<DeficiencyRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inspectionRound, setInspectionRound] = useState<string>('2024-001');
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentSearchResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 오류 다이얼로그 상태
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 이행결과 작성 다이얼로그 상태
  const [implementationDialogOpen, setImplementationDialogOpen] = useState(false);
  const [selectedImplementationData, setSelectedImplementationData] = useState<ImplementationResultData | undefined>();

  // 옵션 데이터 상태
  const [inspectionRoundOptions, setInspectionRoundOptions] = useState([
    { value: '2024-001', label: '2024-001' },
    { value: '2024-002', label: '2024-002' },
    { value: '2024-003', label: '2024-003' },
  ]);

  // 데이터 로드 함수
  const fetchDeficiencies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 실제 API 호출
      const data = await deficiencyStatusApi.getAllDeficiencyStatusList();

      if (Array.isArray(data)) {
        // 백엔드 응답 데이터를 프론트엔드 형식에 맞게 매핑
        const mappedData = data.map(item => ({
          ...item,
          id: item.auditProgMngtDetailId || item.id, // ID 매핑
        }));

        setRows(mappedData);
      } else {
        setRows([]);
      }
    } catch (err) {
      setError('미흡상황 현황 데이터를 불러오는 데 실패했습니다.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [departmentFilter, inspectionRound]);

  // 옵션 데이터 로드 함수
  const fetchOptions = useCallback(async () => {
    try {
      // 점검회차 목록 조회
      const rounds = await deficiencyStatusApi.getInspectionRoundList();
      setInspectionRoundOptions(rounds);
    } catch (error) {
      // 에러 시 기본값 유지
    }
  }, []);

  useEffect(() => {
    fetchOptions();
    fetchDeficiencies();
  }, [fetchOptions, fetchDeficiencies]);

  // 상태 색상 반환 함수
  const getStatusColor = (status: string): string => {
          if (status.includes('완료')) return '#2e7d32'; // 녹색
          if (status.includes('이행중')) return '#ed6c02'; // 주황색
          if (status.includes('수립완료')) return '#1976d2'; // 파란색
          if (status.includes('수립중')) return '#9c27b0'; // 보라색
          return '#666666'; // 기본 회색
        };

  // 개선현황 셀 렌더링 함수
  const renderImprovementPlanCell = ({ row }: { row: DeficiencyRow }) => {
    const status = String(row.improvementPlan);

        return (
          <span
            style={{
              color: getStatusColor(status),
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleDeficiencyClick(row.id);
            }}
          >
            {status}
          </span>
        );
  };

  // 이행결과 셀 렌더링 함수
  const renderImplementationResultCell = ({ value }: { value: string | number | undefined }) => (
    <span style={{
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }}>
      {value || '-'}
    </span>
  );

  // 작성일자 셀 렌더링 함수
  const renderWriteDateCell = ({ value }: { value: string | number | undefined }) => 
    dayjs(String(value)).format('YYYY.MM.DD');

  // 컬럼 정의
  const columns: DataGridColumn<DeficiencyRow>[] = [
    {
      field: 'improvementPlan',
      headerName: '개선현황',
      width: 200,
      align: 'center',
      headerAlign: 'center',
      renderCell: renderImprovementPlanCell,
    },
    {
      field: 'inspector',
      headerName: '점검자',
      width: 120,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'deficiencyContent',
      headerName: '미흡사항',
      width: 250,
      flex: 1
    },
    {
      field: 'auditDoneContent',
      headerName: '이행결과',
      width: 200,
      flex: 1,
      renderCell: renderImplementationResultCell,
    },
    {
      field: 'writeDate',
      headerName: '작성일자',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: renderWriteDateCell,
    },
  ];

  // 조회 버튼 클릭 핸들러
  const handleSearch = () => {
    fetchDeficiencies();
  };

  // 개선계획 셀 클릭 핸들러
  const handleDeficiencyClick = (_deficiencyId: number) => {
    // TODO: 상세조회 다이얼로그 구현
  };

  // 개선계획 변경 버튼 클릭 핸들러
  const handleImprovementPlanChange = () => {
    if (selectedIds.length === 0) {
      setErrorMessage('개선계획을 변경할 항목을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }
    // TODO: 개선계획 변경 다이얼로그 구현
  };

  // 이행결과 작성 버튼 클릭 핸들러
  const handleImplementationWrite = () => {
    if (selectedIds.length === 0) {
      setErrorMessage('이행결과를 작성할 항목을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    // 선택된 첫 번째 항목의 데이터 가져오기
    const selectedRow = rows.find(row => row.id === selectedIds[0]);
    if (selectedRow) {
      const implementationData: ImplementationResultData = {
        id: selectedRow.id,
        auditProgMngtId: selectedRow.auditProgMngtId,  // 점검계획 ID 추가
        deficiencyContent: selectedRow.deficiencyContent || '',
        improvementPlan: selectedRow.improvementPlan || '',
        auditDetailCoantent: selectedRow.auditDetailCoantent || '',
        auditDoneContent: selectedRow.auditDoneContent || '',
        auditDoneDt: selectedRow.auditDoneDt || '',
        implementationStatus: selectedRow.statusName || '완료',
      };
      setSelectedImplementationData(implementationData);
      setImplementationDialogOpen(true);
    }
  };

  // 승인하기 버튼 클릭 핸들러
  const handleApproval = () => {
    if (selectedIds.length === 0) {
      setErrorMessage('승인할 항목을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }
    // TODO: 승인 다이얼로그 구현
  };

  // 오류 다이얼로그 닫기
  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

  // 이행결과 저장 핸들러
  const handleImplementationSave = async (data: ImplementationResultData) => {
    try {
      // 실제 API 호출로 이행결과 저장
      const requestData = {
        ids: [data.id],
        implementationResult: data.auditDoneContent || '',
        completionDate: data.auditDoneDt || '',
        statusCode: '완료', // 기본값으로 완료 설정
        remarks: ''
      };

      await deficiencyStatusApi.updateImplementationResult(requestData);

      // 성공 시 데이터 다시 로드
      await fetchDeficiencies();

      // 선택 해제
      setSelectedIds([]);
    } catch (error) {
      throw error;
    }
  };

  // 이행결과 다이얼로그 닫기
  const handleImplementationDialogClose = () => {
    setImplementationDialogOpen(false);
    setSelectedImplementationData(undefined);
  };

  return (
    <PageContainer>
      <PageHeader
        title="[1200] 미흡상황 현황"
        icon={<GroupsIcon />}
        description="점검 결과에 대한 미흡상황 현황을 조회하고 관리합니다."
        elevation={false}
      />
      <PageContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'auto',
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
            value={inspectionRound}
            onChange={(value) => setInspectionRound(value as string)}
            options={inspectionRoundOptions}
            size="small"
            sx={{ minWidth: '200px' }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>부서</span>
          <DepartmentSelect
            value={departmentFilter}
            onChange={setDepartmentFilter}
            size="small"
            placeholder="부서 선택"
            sx={{ minWidth: '200px' }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleSearch}
            color="primary"
          >
            조회
          </Button>
        </Box>

        {/* 버튼 영역 */}
        <Box sx={{
          display: 'flex',
          gap: '8px',
          marginBottom: '8px',
          justifyContent: 'flex-end'
        }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleImprovementPlanChange}
          >
            개선계획 변경
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleImplementationWrite}
          >
            이행결과 작성
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={handleApproval}
          >
            승인하기
          </Button>
        </Box>

        {/* 그리드 영역 */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <DataGrid
            data={rows}
            columns={columns}
            loading={loading}
            error={error}
            selectedRows={selectedIds}
            selectable={true}
            multiSelect={false}
            disableColumnSort={true}
            onRowSelectionChange={(selectedIds: (string | number)[], _selectedData: DeficiencyRow[]) => {
              setSelectedIds(selectedIds.map(id => Number(id)));
            }}
          />
        </Box>

        {/* 오류 다이얼로그 */}
        <Modal
          open={errorDialogOpen}
          onClose={handleCloseErrorDialog}
          title="알림"
        >
          <Typography>{errorMessage}</Typography>
        </Modal>

        {/* 이행결과 작성 다이얼로그 */}
        <ImplementationResultDialog
          open={implementationDialogOpen}
          onClose={handleImplementationDialogClose}
          data={selectedImplementationData}
          onSave={handleImplementationSave}
          mode="edit"
        />
      </PageContent>
    </PageContainer>
  );
};

export default DeficiencyStatusPage;