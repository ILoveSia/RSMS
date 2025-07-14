/**
 * 책무 DB 현황 페이지 컴포넌트
 */
import { Button, DataGrid } from '@/shared/components/ui';
import { Groups as GroupsIcon } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { Box, InputAdornment } from '@mui/material';
import TextField from '@/shared/components/ui/data-display/textfield';
import type { GridColDef } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../../../assets/scss/style.css';
import { ComboBox } from '../../../shared/components/ui/form';
import PageContainer from '../../../shared/components/ui/layout/PageContainer';
import PageContent from '../../../shared/components/ui/layout/PageContent';
import PageHeader from '../../../shared/components/ui/layout/PageHeader';
import { responsibilityApi, type ResponsibilityRow } from '../api/responsibilityApi';
import ResponsibilityDialog from '../components/ResponsibilityDialog';
interface SelectOption {
  value: string;
  label: string;
}

interface IResponsibilityDbStatusPageProps {
  className?: string;
}

const ResponsibilityDbStatusPage: React.FC<IResponsibilityDbStatusPageProps> = React.memo(():React.JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ResponsibilityRow[]>([]);
  const [selectedResponsibilityId, setSelectedResponsibilityId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('view');

  // 검색 조건 상태
  const [ledgerOrder, setLedgerOrder] = useState<string>('2024-001');
  const [searchText, setSearchText] = useState<string>('');

  // 원장차수 옵션
  const ledgerOrderOptions: SelectOption[] = [
    { value: '2024-001', label: '2024-001' },
    { value: '2024-002', label: '2024-002' },
    { value: '2024-003', label: '2024-003' }
  ];

  // 책무 목록 조회 (성능 최적화)
  const fetchResponsibilities = useCallback(async (searchId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await responsibilityApi.getStatusList(searchId);
    } catch (err) {
      console.error('[ResponsibilityDbStatusPage] 책무 데이터 로드 실패:', err);
      const errorMessage = '책무 DB 현황 데이터를 불러오는 데 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResponsibilities();
  }, [fetchResponsibilities]);

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = useCallback(async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('책무 DB 현황');

      // 헤더 설정
      const headers = [
        '책무 ID',
        '책무',
        '책무 세부내용 ID',
        '책무 세부내용',
        '책무이행을 위한 주요 관리업무',
        '관련 근거',
        '등록일자',
        '최종수정일자',
      ];
      worksheet.addRow(headers);

      // 헤더 스타일 설정
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB0C4DE' }, // lightsteelblue
      };

      // 데이터 추가
      rows.forEach(row => {
        worksheet.addRow([
          row.responsibilityId,
          row.responsibilityContent,
          row.responsibilityDetailId,
          row.responsibilityDetailContent,
          row.responsibilityMgtSts,
          row.responsibilityRelEvid,
          dayjs(row.createdAt).format('YYYY.MM.DD'),
          dayjs(row.updatedAt).format('YYYY.MM.DD'),
        ]);
      });

      // 컬럼 너비 자동 조정
      worksheet.columns.forEach(column => {
        column.width = Math.max(column.width || 0, 15);
      });

      // 파일 생성 및 다운로드
      const excelBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `책무_DB_현황_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      setError('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  }, [rows]);

  // 컬럼 정의 (성능 최적화)
  const columns: GridColDef<ResponsibilityRow>[] = useMemo(
    () => [
      {
        field: 'responsibilityId',
        headerName: '책무 ID',
        width: 100,
        sortable: false,
        align: 'center',
        cellClassName: 'wrap-text',
      },
      {
        field: 'responsibilityContent',
        headerName: '책무',
        width: 250,
        flex: 1,
        sortable: false,
        align: 'center',
        cellClassName: 'wrap-text',
        renderCell: params => (
          <span
            style={{
              color: 'var(--bank-primary)',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            onClick={e => {
              e.stopPropagation();
              handleResponsibilityCellClick(params.row.responsibilityId.toString());
            }}
          >
            {params.value}
          </span>
        ),
      },
      {
        field: 'responsibilityDetailId',
        headerName: '책무 세부내용 ID',
        width: 150,
        cellClassName: 'wrap-text',
      },
      {
        field: 'responsibilityDetailContent',
        headerName: '책무 세부내용',
        width: 300,
        flex: 1,
        cellClassName: 'wrap-text',
      },
      {
        field: 'responsibilityMgtSts',
        headerName: '책무이행을 위한 주요 관리업무',
        width: 300,
        flex: 2,
        cellClassName: 'wrap-text',
      },
      {
        field: 'responsibilityRelEvid',
        headerName: '관련 근거',
        width: 200,
        flex: 1,
        cellClassName: 'wrap-text',
      },
      {
        field: 'createdAt',
        headerName: '등록일자',
        width: 90,
        valueFormatter: (value: any) => dayjs(value).format('YYYY.MM.DD'),
        align: 'center',
        cellClassName: 'wrap-text',
      },
      {
        field: 'updatedAt',
        headerName: '최종수정일자',
        width: 100,
        valueFormatter: (value: any) => dayjs(value).format('YYYY.MM.DD'),
        align: 'center',
        cellClassName: 'wrap-text',
      },
    ],
    []
  );

  // 조회 버튼 클릭 핸들러
  const handleSearch = useCallback(() => {
    fetchResponsibilities(searchText);
  }, [searchText, fetchResponsibilities]);

  // 등록 버튼 클릭 핸들러
  const handleCreateClick = useCallback(() => {
    setSelectedResponsibilityId(null);
    setDialogMode('create');
    setDialogOpen(true);
  }, []);

    // '책무' 셀 클릭 시 상세조회 다이얼로그 오픈 (성능 최적화)
    const handleResponsibilityCellClick = useCallback((responsibilityId: string) => {
      // React 18의 자동 배치 처리를 활용하여 상태 동시 업데이트
      setSelectedResponsibilityId(Number(responsibilityId));
      setDialogMode('view');
      setDialogOpen(true);
    }, []);

    // 다이얼로그 닫기 (성능 최적화)
    const handleDialogClose = useCallback(() => {
      setDialogOpen(false);
      setSelectedResponsibilityId(null);
    }, []);

  // 다이얼로그 저장
  const handleDialogSave = useCallback(() => {
    handleDialogClose();
    fetchResponsibilities(); // 목록 새로고침
  }, [handleDialogClose, fetchResponsibilities]);

  // 다이얼로그 모드 변경
  const handleModeChange = useCallback((newMode: 'create' | 'edit' | 'view') => {
    setDialogMode(newMode);
  }, []);

    // 검색 텍스트 변경 핸들러 (성능 최적화)
    const handleSearchTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
    }, []);

  return (
    <PageContainer>

      <PageHeader
        title=' [300] 책무 DB 현황'
        icon={<GroupsIcon />}
        description='책무 현황과 변경이력을 조회하고 관리합니다.'
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
          position: 'relative',  // 좌우 패딩을 3으로 수정
          py: 1,
          px:0
        }}
      >
        {/* 필터 영역 */}
        <Box
          sx={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            padding: '8px 16px',
            borderRadius: '4px',
          }}
        >
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>책무번호</span>
          <ComboBox
            value={ledgerOrder}
            options={ledgerOrderOptions}
            onChange={value => setLedgerOrder(value as string)}
            size="small"
            sx={{ width: '130px' }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>
            책무 ID
          </span>
          <TextField
            size="small"
            variant="outlined"
            placeholder="텍스트 입력"
            value={searchText}
            onChange={handleSearchTextChange}
            sx={{ backgroundColor: 'white' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" size="small" onClick={handleSearch} color="primary">
            조회
          </Button>
        </Box>

        {/* 버튼 영역 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="success"
            sx={{ mr: 1 }}
            onClick={handleExcelDownload}
          >
            엑셀 다운로드
          </Button>
          <Button variant="contained" size="small" color="warning" sx={{ mr: 1 }}>
            변경 이력
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            sx={{ mr: 1 }}
            onClick={handleCreateClick}
          >
            등록
          </Button>
          <Button variant="contained" size="small" color="error" sx={{ mr: 1 }}>
            삭제
          </Button>
        </Box>

        {/* 데이터 그리드 */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <DataGrid
            className="responsibility-grid"
            data={rows}
            columns={columns as any}
            loading={loading}
            selectable={true}
          />
        </Box>
      </PageContent>
      {/* 책무 다이얼로그 */}
      <ResponsibilityDialog
        open={dialogOpen}
        mode={dialogMode}
        responsibilityId={selectedResponsibilityId}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        onChangeMode={handleModeChange}
      />
      </PageContainer>
  );
});

export default ResponsibilityDbStatusPage;
