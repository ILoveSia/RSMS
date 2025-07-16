import { Button, Select } from '@/shared/components/ui';
import { DataGrid } from '@/shared/components/ui/data-display';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn, SelectOption } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Box, FormControl, InputLabel, MenuItem, type SelectChangeEvent } from '@mui/material';
import React, { useCallback, useState } from 'react';

interface IHodICitemStatusPageProps {
  className?: string;
}

// 부서장 내부통제 항목 데이터 타입
interface HodICItemRow {
  id: number;
  division: string; // 구분
  responsibilityId: string; //책무ID
  responsibilityContent: string; // 책무내용
  detailClassificationId: string; // 세부분류ID
  initialValue: string; // 초기값
  initialAssessmentValue: string; // 초사값
  number: number; // 수자
  lastYearValue: string; // 전년도가
  lastYearPrice: string; // 전년 시가
  lastYearReflection: string; // 전년 반영
  legalPeriod: string; // 공법기간
  finalPrice: string; // 최종 시가
  remarks: string; // 비고
}

const HodICitemStatusPage: React.FC<IHodICitemStatusPageProps> = (): React.JSX.Element => {
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rows, setRows] = useState<HodICItemRow[]>([]);

  // 원장차수 옵션 데이터 (실제로는 API에서 가져와야 함)
  const ledgerOrderOptions: SelectOption[] = [
    { value: '2024-001-01', label: '2024-001-01(부서장)' },
    { value: '2024-002-01', label: '2024-002-01(진행중)' },
    { value: '2024-003-01', label: '2024-003-01(완료)' },
  ];

  // 샘플 데이터 (실제로는 API에서 가져와야 함)
  const sampleData: HodICItemRow[] = [
    {
      id: 1,
      division: '금융',
      responsibilityContent:
        '중간광역자금중개업체 운영에 관한 규정에 따라 중간광역자금중개업체를 적절하게 관리감독하고 있는지 점검',
      detailClassificationId: 'xxx',
      initialValue: '신용위치',
      initialAssessmentValue: '수시',
      number: 1,
      lastYearValue: '중간광역자금중개업체: 제3조 중간광역자금중개업체',
      lastYearPrice: '12월',
      lastYearReflection:
        '1. 당금 및 중간 관리 중간광역자금중개업체를 확정하여 중간광역자금중개업체를 관제한다.',
      legalPeriod: '2024.01~05',
      finalPrice: 'xxx',
      remarks: '',
    },
    {
      id: 2,
      division: '금융',
      responsibilityContent: '보관업무 관련 상당 전문성 등 검토',
      detailClassificationId: 'xxx',
      initialValue: '보관(중앙)',
      initialAssessmentValue: '분',
      number: 2,
      lastYearValue:
        '보관과 관련된 지위 등에 관한 주의사항을 검토하고, 매2년마다 보관업무를 재검토 또한',
      lastYearPrice: '1년',
      lastYearReflection:
        '1. 영업일 및 종금 직업정령의 지침 및 종금정보를 검금정하여 2. 당금 및 당정으로 투자정책 동향 등을 중신 영업정하지 않는 경우는 적금공정으로 시행',
      legalPeriod: '2024.01~05',
      finalPrice: 'xxx',
      remarks: '',
    },
    {
      id: 3,
      division: '중간광역',
      responsibilityContent: '영업정지처분이 가능한 중간 교육',
      detailClassificationId: 'xxx',
      initialValue: '중간광역자금과 불등 관리 지침',
      initialAssessmentValue: '수시',
      number: 3,
      lastYearValue: '중간광역교육, 능력 관리 기대',
      lastYearPrice: '1, 4, 7, 10월',
      lastYearReflection:
        '1. 영업일 및 종금 직업정령의 지침 및 종금정보를 검금정하여 지침 방식을 시행한 경우 시행',
      legalPeriod: '2024.01~05',
      finalPrice: 'xxx',
      remarks: '',
    },
  ];

  // 컬럼 정의 - 이미지의 헤더와 일치하도록 구성
  const columns: DataGridColumn<HodICItemRow>[] = [
    {
      field: 'responsibilityId',
      headerName: '책무ID',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'responsibilityContent',
      headerName: '책무내용',
      width: 100,
      flex: 1,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'detailClassificationId',
      headerName: '부서명',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'initialValue',
      headerName: '항목구분',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'initialAssessmentValue',
      headerName: '직무구분',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'number',
      headerName: '내부통제 업무',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'lastYearValue',
      headerName: '조치활동',
      width: 100,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'lastYearPrice',
      headerName: '조치유형',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'lastYearReflection',
      headerName: '주기',
      width: 80,
      flex: 1,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'legalPeriod',
      headerName: '관련근거',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'finalPrice',
      headerName: '점검시기',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'remarks',
      headerName: '점검방법',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'remarks',
      headerName: '등록일자',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'remarks',
      headerName: '최종수정일자',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
  ];

  const handleSearch = useCallback(() => {
    setLoading(true);
    setError(null);
    // 여기서 실제 API 호출
    setTimeout(() => {
      try {
        setRows(sampleData);
      } catch {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }, 1000);
  }, [selectedLedgerOrder]);

  const handleExcelDownload = useCallback(() => {
    // 엑셀 다운로드 로직
    console.log('엑셀 다운로드');
  }, [rows]);

  const handleCreateClick = useCallback(() => {
    // 등록 로직
    console.log('등록');
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedIds.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }
    if (confirm(`선택한 ${selectedIds.length}개 항목을 삭제하시겠습니까?`)) {
      // 삭제 로직
      console.log('삭제:', selectedIds);
    }
  }, [selectedIds]);

  const handleLedgerOrderChange = useCallback((event: SelectChangeEvent<string>) => {
    setSelectedLedgerOrder(event.target.value);
  }, []);

  return (
    <PageContainer
      sx={{
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <PageHeader
        title='[200] 부서장 내부통제 항목 현황'
        icon={<GroupsIcon />}
        description='부서장 내부통제 항목별 현황을 조회하고 관리합니다.'
        elevation={false}
        sx={{
          position: 'relative',
          zIndex: 1,
          flexShrink: 0,
        }}
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
        <Box
          sx={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            alignItems: 'center',
            backgroundColor: 'var(--bank-bg-secondary)',
            border: '1px solid var(--bank-border)',
            padding: '8px 16px',
            borderRadius: '4px',
          }}
        >
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>책무번호</span>
          <FormControl size='small' sx={{ minWidth: 200 }}>
            <InputLabel>전체</InputLabel>
            <Select value={selectedLedgerOrder} onChange={handleLedgerOrderChange} label='전체'>
              <MenuItem value=''>전체</MenuItem>
              {ledgerOrderOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant='contained' size='small' onClick={handleSearch} color='primary'>
            조회
          </Button>

          <Box sx={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <Button
              variant='contained'
              size='small'
              color='success'
              onClick={() => {
                /* 확정 로직 미구현 */
              }}
            >
              확정
            </Button>
            <Button
              variant='contained'
              size='small'
              color='error'
              onClick={() => {
                /* 확정취소 로직 미구현 */
              }}
            >
              확정취소
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
          <Button
            variant='contained'
            size='small'
            color='success'
            onClick={handleExcelDownload}
            sx={{ mr: 1 }}
          >
            엑셀 다운로드
          </Button>
          <Button
            variant='contained'
            size='small'
            color='primary'
            onClick={handleCreateClick}
            sx={{ mr: 1 }}
          >
            등록
          </Button>
          <Button variant='contained' size='small' onClick={handleDelete} color='error'>
            삭제
          </Button>
        </Box>
        <Box sx={{ width: '100%', flex: 1 }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <DataGrid
            data={rows}
            columns={columns}
            loading={loading}
            selectable={true}
            multiSelect={true}
            selectedRows={selectedIds}
            onRowSelectionChange={selectedRows => {
              setSelectedIds(selectedRows.map(id => Number(id)));
            }}
            rowIdField='id'
            sx={{
              width: '100%',
              height: '100%',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'var(--bank-bg-secondary) !important',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
              },
            }}
          />
        </Box>
      </PageContent>
    </PageContainer>
  );
};

export default HodICitemStatusPage;
