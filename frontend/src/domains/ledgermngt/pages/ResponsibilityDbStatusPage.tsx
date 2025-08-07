/**
 * 책무 DB 현황 페이지 컴포넌트
 */
import '@/assets/scss/style.css';
import { DataGrid } from '@/shared/components/ui';
import { SearchButton, ManagementButtonGroup, ExcelDownloadButton } from '@/shared/components/ui/button';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import Toast from '@/shared/components/ui/feedback/Toast';
import { LedgerOrderSelect } from '@/shared/components/ui/form';
import PageContainer from '@/shared/components/ui/layout/PageContainer';
import ResponsibilitySelect from '@/shared/components/ui/form/ResponsibilitySelect';
import PageContent from '@/shared/components/ui/layout/PageContent';
import PageHeader from '@/shared/components/ui/layout/PageHeader';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Box } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { type ResponsibilityRow } from '../api/responsibilityApi';
import ResponsibilityDialog from '../components/ResponsibilityDialog';
import responsibilityApi from '../api/responsibilityApi';

// 그룹핑된 책무 데이터 타입 정의
interface GroupedResponsibility {
  responsibilityId: number;
  responsibilityContent: string;
  createdAt: string;
  updatedAt: string;
  details: Array<{
    responsibilityDetailId: number;
    responsibilityDetailContent: string;
    responsibilityMgtSts: string;
    responsibilityRelEvid: string;
  }>;
}

// DataGrid에서 사용할 그룹핑된 행 데이터 타입
interface GroupedResponsibilityRow {
  responsibilityId: number;
  responsibilityContent: string;
  responsibilityDetailContent: string; // 콤마로 구분된 문자열
  responsibilityMgtSts: string; // 콤마로 구분된 문자열
  responsibilityRelEvid: string; // 콤마로 구분된 문자열
  createdAt: string;
  updatedAt: string;
  detailCount: number; // 세부사항 개수
}

interface IResponsibilityDbStatusPageProps {
  className?: string;
}

const ResponsibilityDbStatusPage: React.FC<IResponsibilityDbStatusPageProps> = React.memo(
  (): React.JSX.Element => {
    // Toast 알림을 위한 snackbar hook
    const { snackbar, showError, hideSnackbar } = useSnackbar();
    
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<GroupedResponsibilityRow[]>([]);
    const [selectedResponsibilityId, setSelectedResponsibilityId] = useState<number | null>(null);
    const [selectedRowData, setSelectedRowData] = useState<any>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('view');
    // 검색 조건 상태
    const [ledgerOrder, setLedgerOrder] = useState<string>('ALL');
    const [ledgerOrdersId, setLedgerOrdersId] = useState<number | undefined>(undefined);
    const [searchText, setSearchText] = useState<string>('');
    const [selectedResponsibility, setSelectedResponsibility] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [data, setData] = useState<ResponsibilityRow[]>([]);
    const [groupedData, setGroupedData] = useState<GroupedResponsibility[]>([]);
    
    // LedgerOrder 옵션 목록을 저장할 state (상세 정보 조회용)
    const [ledgerOrderOptions, setLedgerOrderOptions] = useState<Array<{value: string, label: string, ledgerOrdersId: number}>>([]);

    // 프론트엔드 필터링을 위한 상태
    const [allResponsibilityData, setAllResponsibilityData] = useState<ResponsibilityRow[]>([]);

    // 원장차수는 LedgerOrderSelect에서 자동 관리

    // 데이터 그룹핑 함수
    const groupDataByResponsibilityId = useCallback((data: ResponsibilityRow[]): GroupedResponsibility[] => {
      const groupMap = new Map<number, GroupedResponsibility>();

      data.forEach(item => {
        const { responsibilityId, responsibilityContent, createdAt, updatedAt,
          responsibilityDetailId, responsibilityDetailContent, responsibilityMgtSts, responsibilityRelEvid } = item;

        if (!groupMap.has(responsibilityId)) {
          groupMap.set(responsibilityId, {
            responsibilityId,
            responsibilityContent,
            createdAt,
            updatedAt,
            details: []
          });
        }

        const group = groupMap.get(responsibilityId)!;
        group.details.push({
          responsibilityDetailId,
          responsibilityDetailContent,
          responsibilityMgtSts,
          responsibilityRelEvid
        });
      });

      return Array.from(groupMap.values());
    }, []);

    // 그룹핑된 데이터를 DataGrid용 행 데이터로 변환
    const convertToGridRows = useCallback((groupedData: GroupedResponsibility[]): GroupedResponsibilityRow[] => {
      return groupedData.map(group => {
        const formatWithCount = (items: string[]) => {
          if (items.length === 1) {
            return items[0];
          }
          return `${items[0]} 외 ${items.length - 1}개`;
        };

        const formatRelEvid = (items: string[]) => {
          // 관련 근거는 동일한 값이므로 첫 번째 값만 표시
          return items[0] || '';
        };

        return {
          responsibilityId: group.responsibilityId,
          responsibilityContent: group.responsibilityContent,
          responsibilityDetailContent: formatWithCount(group.details.map(d => d.responsibilityDetailContent)),
          responsibilityMgtSts: formatWithCount(group.details.map(d => d.responsibilityMgtSts)),
          responsibilityRelEvid: formatRelEvid(group.details.map(d => d.responsibilityRelEvid)),
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
          detailCount: group.details.length
        };
      });
    }, []);

    // 모든 데이터 로드 (한 번만)
    const loadAllData = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await responsibilityApi.getStatusList();

        setAllResponsibilityData(data);
        
      } catch (err) {
        console.error('[ResponsibilityDbStatusPage] 책무 데이터 로드 실패:', err);
        const errorMessage = '책무 DB 현황 데이터를 불러오는 데 실패했습니다.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }, []);

    // 책무 현황 조회 (ledgerOrdersId와 responsibilityId 모두 지원)
    const fetchResponsibilityData = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        // responsibilityId 파라미터 처리
        const responsibilityIdParam = selectedResponsibility?.responsibilityId 
          ? selectedResponsibility.responsibilityId.toString()
          : undefined;

        console.log('📊 책무 현황 조회 - ledgerOrdersId:', ledgerOrdersId, 'responsibilityId:', responsibilityIdParam);
        
        // API 호출: responsibilityId와 ledgerOrdersId 모두 전달
        const data = await responsibilityApi.getStatusList(responsibilityIdParam, ledgerOrdersId);

        setAllResponsibilityData(data);
        setData(data);

        // 데이터 그룹핑
        const grouped = groupDataByResponsibilityId(data);
        setGroupedData(grouped);

        // 그룹핑된 데이터를 DataGrid용으로 변환
        const gridRows = convertToGridRows(grouped);
        setRows(gridRows);
      } catch (err) {
        console.error('[ResponsibilityDbStatusPage] 책무 데이터 로드 실패:', err);
        const errorMessage = '책무 DB 현황 데이터를 불러오는 데 실패했습니다.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }, [ledgerOrdersId, selectedResponsibility, groupDataByResponsibilityId, convertToGridRows]);


    useEffect(() => {
      loadAllData();
    }, [loadAllData]);

    // 그룹핑된 데이터 활용 유틸리티 함수들
    const getResponsibilityById = useCallback((responsibilityId: number): GroupedResponsibility | undefined => {
      return groupedData.find(item => item.responsibilityId === responsibilityId);
    }, [groupedData]);


    // 엑셀 다운로드 핸들러
    const handleExcelDownload = useCallback(async () => {
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('책무 DB 현황');

        // 헤더 설정
        const headers = [
          '책무 ID',
          '책무',
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

        // 그룹핑된 데이터 추가
        rows.forEach(row => {
          worksheet.addRow([
            row.responsibilityId,
            row.responsibilityContent,
            row.responsibilityDetailContent,
            row.responsibilityMgtSts,
            row.responsibilityRelEvid,
            dayjs(row.createdAt).format('YYYY.MM.DD'),
            dayjs(row.updatedAt).format('YYYY.MM.DD'),
          ]);
        });

        // 컬럼 너비 자동 조정
        worksheet.columns.forEach(column => {
          column.width = Math.max(column.width || 0, 20);
        });

        // 파일 생성 및 다운로드
        const excelBuffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, `책무_DB_현황_그룹핑_${new Date().toISOString().slice(0, 10)}.xlsx`);
      } catch (error) {
        console.error('엑셀 다운로드 실패:', error);
        setError('엑셀 다운로드 중 오류가 발생했습니다.');
      }
    }, [rows]);

    // 컬럼 정의 (성능 최적화)
    const columns: GridColDef<GroupedResponsibilityRow>[] = useMemo(
      () => [
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

                // 그룹핑된 데이터에서 해당 책무의 모든 세부항목들을 가져오기
                const groupedResponsibility = getResponsibilityById(params.row.responsibilityId);

                // 다이얼로그에서 사용할 수 있는 형태로 데이터 변환
                const dialogData = groupedResponsibility ? {
                  responsibilityId: groupedResponsibility.responsibilityId,
                  responsibilityContent: groupedResponsibility.responsibilityContent,
                  createdAt: groupedResponsibility.createdAt,
                  updatedAt: groupedResponsibility.updatedAt,
                  // 모든 세부항목들을 포함
                  allDetails: groupedResponsibility.details
                } : null;

                // React 18의 자동 배치 처리를 활용하여 상태 동시 업데이트
                setSelectedResponsibilityId(params.row.responsibilityId);
                setSelectedRowData(dialogData);
                setDialogMode('view');
                setDialogOpen(true);
              }}
            >
              {params.value}
            </span>
          ),
        },
        {
          field: 'responsibilityDetailContent',
          headerName: '책무 세부내용',
          width: 300,
          flex: 1,
          cellClassName: 'wrap-text',
          renderCell: params => (
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {params.value}
            </div>
          ),
        },
        {
          field: 'responsibilityMgtSts',
          headerName: '책무이행을 위한 주요 관리업무',
          width: 300,
          flex: 2,
          cellClassName: 'wrap-text',
          renderCell: params => (
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {params.value}
            </div>
          ),
        },
        {
          field: 'responsibilityRelEvid',
          headerName: '관련 근거',
          width: 200,
          flex: 1,
          cellClassName: 'wrap-text',
          renderCell: params => (
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {params.value}
            </div>
          ),
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
      [data, setSelectedResponsibilityId, setSelectedRowData, setDialogMode, setDialogOpen]
    );

    // 조회 버튼 클릭 핸들러
    const handleSearch = useCallback(() => {
      console.log('🔍 검색 버튼 클릭 - 선택된 ledgerOrdersId:', ledgerOrdersId);
      fetchResponsibilityData();
    }, [fetchResponsibilityData]);

    // 등록 버튼 클릭 핸들러
    const handleCreateClick = useCallback(() => {
      // 1. LedgerOrderSelect 선택 검증
      if (!ledgerOrder || ledgerOrder === 'ALL') {
        showError('원장차수를 선택해주세요.');
        return;
      }

      // 2. "직책확정" 상태 검증
      const selectedOption = ledgerOrderOptions.find(option => option.value === ledgerOrder);
      if (!selectedOption) {
        showError('선택된 원장차수 정보를 찾을 수 없습니다.');
        return;
      }

      // label에서 상태 정보 추출하여 "직책확정" 여부 확인
      let statusInfo = '';
      if (selectedOption.label.includes('(') && selectedOption.label.includes(')')) {
        const statusMatch = selectedOption.label.match(/\(([^)]+)\)/);
        if (statusMatch) {
          statusInfo = statusMatch[1];
        }
      }

      if (statusInfo !== '직책확정') {
        showError('직책확정 상태의 원장차수만 등록 가능합니다.');
        return;
      }

      console.log('✅ 등록 버튼 검증 통과 - 선택된 원장차수:', ledgerOrder, '상태:', statusInfo);

      // 3. ResponsibilityDialog 열기 (원장차수 값 전달)
      setSelectedResponsibilityId(null);
      setDialogMode('create');
      setDialogOpen(true);
    }, [ledgerOrder, ledgerOrderOptions, showError]);



    // 다이얼로그 닫기 (성능 최적화)
    const handleDialogClose = useCallback(() => {
      setDialogOpen(false);
      setSelectedResponsibilityId(null);
      setSelectedRowData(null);
    }, []);

    // 다이얼로그 저장
    const handleDialogSave = useCallback(() => {
      handleDialogClose();
      fetchResponsibilityData(); // 데이터를 다시 로드하여 필터링 및 그룹핑 적용
    }, [handleDialogClose, fetchResponsibilityData]);

    // 다이얼로그 모드 변경
    const handleModeChange = useCallback((newMode: 'create' | 'edit' | 'view') => {
      setDialogMode(newMode);
    }, []);


    const handleDelete = useCallback(async () => {
      if (selectedIds.length > 0) {
        try {
          setLoading(true);
          // 선택된 행의 responsibilityId를 찾기
          const selectedRow = rows.find((_, index) => selectedIds.includes(index));
          if (selectedRow) {
            await responsibilityApi.delete(selectedRow.responsibilityId);
            await fetchResponsibilityData(); // 삭제 완료 후 데이터 새로고침
            setSelectedIds([]); // 선택 해제
          }
        } catch (error) {
          console.error('책무 삭제 실패:', error);
          setError('책무 삭제 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      }
    }, [selectedIds, rows, fetchResponsibilityData]);

    return (
      <PageContainer
      >
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
            position: 'relative', // 좌우 패딩을 3으로 수정
            py: 1,
            px: 0,
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
            <LedgerOrderSelect
              value={ledgerOrder}
              onChange={useCallback((value: string, ledgerOrdersId?: number) => {
                setLedgerOrder(value);
                setLedgerOrdersId(ledgerOrdersId);
                console.log('LedgerOrder 선택 변경:', { value, ledgerOrdersId });
              }, [])}
              size='small'
              sx={{ minWidth: 150, maxWidth: 200 }}
              onLoadComplete={useCallback((options: Array<{value: string, label: string, ledgerOrdersId: number}>) => {
                setLedgerOrderOptions(options);
                console.log('LedgerOrder 옵션 로드 완료:', options);
              }, [])}
            />
            <span
            style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}
          >
            책무 ID
          </span>
            <ResponsibilitySelect
              value={selectedResponsibility}
              onChange={setSelectedResponsibility}
              size='small'
              sx={{ minWidth: 150, maxWidth: 200 }}
            />
            <SearchButton
              onClick={handleSearch}
              loading={loading}
              disabled={loading}
            />
          </Box>

          {/* 버튼 영역 */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            mb: 1, 
            gap: 1, 
            alignItems: 'center',
            height: '32px',
          }}>
            <ExcelDownloadButton
              onDownload={handleExcelDownload}
              filename="responsibility_db_status"
              disabled={loading}
              loading={loading}
            />
            <ManagementButtonGroup
              onRegister={handleCreateClick}
              onDelete={handleDelete}
              showRegister={true}
              showDelete={true}
              showEdit={false}
              showRefresh={false}
              registerDisabled={loading}
              deleteDisabled={loading || selectedIds.length === 0}
              align="right"
              sx={{
                mb: 0,
                alignSelf: 'center',
              }}
            />
          </Box>

          {/* 데이터 그리드 */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <DataGrid
              className='responsibility-grid'
              data={rows}
              columns={columns as any}
              loading={loading}
              height={600} 
              selectable={true}
              multiSelect={false}
              selectedRows={selectedIds}
              onRowSelectionChange={selectedRows => {
                setSelectedIds(selectedRows.map(id => Number(id)));
              }}
            // onRowClick={(row: ResponsibilityRow) => {
            //   console.log('DataGrid onRowClick:', row);
            //   setSelectedResponsibilityId(row.responsibilityId);
            //   setSelectedRowData(row);
            //   setDialogMode('view');
            //   setDialogOpen(true);
            // }}
            />
          </Box>
        </PageContent>
        {/* 책무 다이얼로그 */}
        <ResponsibilityDialog
          open={dialogOpen}
          mode={dialogMode}
          responsibilityId={selectedResponsibilityId}
          positionName={selectedRowData?.responsibilityContent || "책무 관리"}
          rowData={selectedRowData}
          selectedLedgerOrder={dialogMode === 'create' ? ledgerOrder : undefined}
          onClose={handleDialogClose}
          onSave={handleDialogSave}
          onChangeMode={handleModeChange as any}
        />
        
        {/* Toast 알림 */}
        <Toast
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={hideSnackbar}
        />
      </PageContainer>
    );
  }
);

export default ResponsibilityDbStatusPage;
