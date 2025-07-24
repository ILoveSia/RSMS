/**
 * 직책별 책무 현황 페이지
 * TestGrid.tsx를 대체하는 실제 업무 페이지
 */
import { Box, Chip } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import LedgerOrderSelect from '@/shared/components/ui/form/LedgerOrderSelect';
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import type { DialogMode } from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import PositionSelect from '@/shared/components/ui/form/PositionSelect';
import type { PositionSearchResult } from '@/domains/ledgermngt/api/positionApi';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn, SelectOption } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import PositionResponsibilityDialog from '../components/PositionResponsibilityDialog';
import { apiClient } from '@/app/common/api/client';
interface IPositionResponsibilityStatusPageProps {
  className?: string;
}

interface PositionResponsibility {
  id: number;
  classification: string;
  positionId: string;
  positionName: string;
  responsibilityOverview: string;
  responsibilityStartDate: string;
  lastModifiedDate: string;
  createdAt: string;
  updatedAt: string;
}

// 그룹핑된 직책별 책무 데이터 타입 정의
interface GroupedPositionResponsibility {
  id: number;
  positionId: string;
  positionName: string;
  classification: string;
  createdAt: string;
  updatedAt: string;
  // 공통 항목들 (같은 직책 내에서 동일한 값)
  responsibilityOverview: string;
  responsibility_conent: string; // 책무 내용
  responsibility_rel_evid: string; // 관련 근거
  responsibilityStartDate: string;
  lastModifiedDate: string;
  // 개별 항목들만 details 배열에 (같은 직책 내에서도 다를 수 있는 값)
  details: Array<{
    responsibility_detail_content: string; // 세부내용
    responsibility_mgt_sts: string; // 주요 관리업무
  }>;
}

// DataGrid에서 사용할 그룹핑된 행 데이터 타입
interface GroupedPositionResponsibilityRow {
  positionId: string;
  positionName: string;
  classification: string; // 공통 구분 (그룹 내 동일)
  responsibilityOverview: string; // 콤마로 구분된 문자열 또는 대표값
  responsibilityStartDate: string;
  lastModifiedDate: string;
  detailCount: number; // 세부사항 개수
}

const PositionResponsibilityStatusPage: React.FC<IPositionResponsibilityStatusPageProps> = (): React.JSX.Element => {
  const [rows, setRows] = useState<GroupedPositionResponsibilityRow[]>([]);
  const [originalData, setOriginalData] = useState<PositionResponsibility[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedPositionResponsibility[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 필터 상태
  const [selectedPosition, setSelectedPosition] = useState<PositionSearchResult | null>(null);

  // 선택된 행
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('view');
  const [selectedDetailData, setSelectedDetailData] = useState<any>(null);
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('ALL');
  // 오류 다이얼로그 상태
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 페이징 상태
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    size: 20,
    totalElements: 0,
    totalPages: 0
  });

  // positions_id로 데이터 그룹화 함수
  const groupDataByPositionId = useCallback((data: PositionResponsibility[]): GroupedPositionResponsibility[] => {
    const groupMap = new Map<string, GroupedPositionResponsibility>();

    data.forEach(item => {
      const { id,positionId, positionName, createdAt, updatedAt, classification, responsibilityOverview, responsibilityStartDate, lastModifiedDate } = item;

      if (!groupMap.has(positionId)) {
        groupMap.set(positionId, {
          id,
          positionId,
          positionName,
          classification,
          createdAt,
          updatedAt,
          // 공통 항목들 (첫 번째 항목의 값을 공통으로 사용)
          responsibilityOverview,
          responsibility_conent: (item as any).responsibility_conent || '',
          responsibility_rel_evid: (item as any).responsibility_rel_evid || '',
          responsibilityStartDate: (item as any).responsibilityStartDate || '',
          lastModifiedDate: (item as any).lastModifiedDate || '',
          details: []
        });
      }

      const group = groupMap.get(positionId)!;
      // 개별 항목들만 details에 저장
      group.details.push({
        responsibility_detail_content: (item as any).responsibility_detail_content || '',
        responsibility_mgt_sts: (item as any).responsibility_mgt_sts || '',
      });
    });

    return Array.from(groupMap.values());
  }, []);

  // 그룹핑된 데이터를 DataGrid용 행 데이터로 변환
  const convertToGridRows = useCallback((groupedData: GroupedPositionResponsibility[]): GroupedPositionResponsibilityRow[] => {
    return groupedData.map(group => {
      const formatWithCount = (items: string[]) => {
        const validItems = items.filter(item => item && item.trim() !== '');
        if (validItems.length === 0) {
          return '해당 없음';
        }
        if (validItems.length === 1) {
          return validItems[0];
        }
        return `${validItems[0]} 외 ${validItems.length - 1}개`;
      };

      return {
        positionId: group.positionId,
        positionName: group.positionName,
        classification: group.classification, // 공통 항목으로 직접 사용
        responsibilityOverview: group.responsibilityOverview,
        responsibilityStartDate: group.responsibilityStartDate,
        lastModifiedDate: group.lastModifiedDate,
        detailCount: group.details.length
      };
    });
  }, []);

  // 그룹화된 데이터 활용 함수들
  const getPositionData = useCallback((positionId: string): GroupedPositionResponsibility | undefined => {
    return groupedData.find(item => item.positionId === positionId);
  }, [groupedData]);

  const getDetailsByPositionId = useCallback((positionId: string) => {
    const position = getPositionData(positionId);
    return position?.details || [];
  }, [getPositionData]);

  // 데이터 로드 함수
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response = null;
      if (selectedPosition === null) {
        response = await fetch('/api/position-responsibilities');
      }
      else {
        response = await fetch(`/api/position-responsibilities/${selectedPosition.positionsId}`);
      }

      const data = await response.json();
      const mappedRows: PositionResponsibility[] = data.map((item: any) => ({
        id: item.respontibility_id ?? item.id ?? 0,
        classification: item.classification ?? '일반',
        positionId: String(item.positions_id ?? ''),
        positionName: item.positions_name ?? '',
        responsibilityOverview: item.role_summ ?? '',
        responsibilityStartDate: item.created_at ?? '',
        responsibilityName: item.responsibility_name ?? '',
        responsibility_detail_content: item.responsibility_detail_content ?? '',
        lastModifiedDate: item.updated_at ?? '',
        createdAt: item.created_at ?? '',
        updatedAt: item.updated_at ?? '',
        // 원본 API 데이터 보존 (다이얼로그에서 사용)
        responsibility_conent: item.responsibility_conent ?? '', // 책무 내용
        responsibility_mgt_sts: item.responsibility_mgt_sts ?? '', // 주요 관리업무
        responsibility_rel_evid: item.responsibility_rel_evid ?? '', // 관련 근거
      }));

      // 원본 데이터 저장
      setOriginalData(mappedRows);

      // 데이터 그룹핑
      const grouped = groupDataByPositionId(mappedRows);

      // 그룹핑 결과 예시 출력
      if (grouped.length > 0) {
      }

      setGroupedData(grouped);

      // 그룹핑된 데이터를 DataGrid용으로 변환
      const gridRows = convertToGridRows(grouped);
      setRows(gridRows);
    }
    catch (err) {
      setErrorMessage('데이터를 불러오는 데 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }, [selectedPosition, pageInfo.page, pageInfo.size, groupDataByPositionId, convertToGridRows]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 컬럼 정의
  const columns: DataGridColumn<GroupedPositionResponsibilityRow>[] = [
    {
      field: 'classification',
      headerName: '구분',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          color={
            value === '핵심' ? 'error' :
              value === '중요' ? 'warning' :
                value === '일반' ? 'default' : 'default'
          }
        />
      )
    },
    {
      field: 'positionName',
      headerName: '직책',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value, row }) => (
        <span
          style={{ color: 'var(--bank-primary)', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();

            // 그룹핑된 데이터에서 해당 직책의 모든 세부항목들을 가져오기
            const groupedPosition = getPositionData(row.positionId);

            // 다이얼로그에서 사용할 수 있는 형태로 데이터 변환
            // 원본 데이터에서 해당 positionId의 첫 번째 항목 찾기
            const originalItem = originalData.find(item => item.positionId === row.positionId);
            const dialogData = groupedPosition && originalItem ? {
              id: originalItem.id,
              classification: groupedPosition.classification,
              positionId: groupedPosition.positionId,
              positionName: groupedPosition.positionName,
              responsibilityOverview: groupedPosition.responsibilityOverview,
              responsibilityStartDate: groupedPosition.responsibilityStartDate,
              lastModifiedDate: groupedPosition.lastModifiedDate,
              createdAt: groupedPosition.createdAt,
              updatedAt: groupedPosition.updatedAt,
              // 그룹화된 데이터에서 직접 가져오기 (데이터 손실 없음)
              // 공통 항목들은 그룹에서 직접 가져오기
              responsibilityContent: groupedPosition.responsibility_conent || '', // 책무 내용
              relatedBasis: groupedPosition.responsibility_rel_evid || '', // 관련 근거
              // 개별 항목들은 details[0]에서 가져오기
              keyManagementTasks: groupedPosition.details[0]?.responsibility_mgt_sts || '', // 주요 관리업무
              // 모든 세부항목들을 포함
              allDetails: groupedPosition.details
            } : null;

            setSelectedDetailData(dialogData);
            setDialogMode('view');
            setDialogOpen(true);
          }}
        >
          {value}
        </span>
      )
    },
    {
      field: 'responsibilityOverview',
      headerName: '책무 개요',
      width: 300,
      flex: 1,
      align: 'left',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {value || '해당 없음'}
        </div>
      )
    },
    {
      field: 'responsibilityStartDate',
      headerName: '책무 시작일',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Box sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}>
          {value || '해당 없음'}
        </Box>
      )
    },
    {
      field: 'lastModifiedDate',
      headerName: '최종 수정일자',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Box sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}>
          {value || '해당 없음'}
        </Box>
      )
    },
  ];

  // 상세보기 핸들러
  const handleViewDetail = (row: GroupedPositionResponsibilityRow) => {
    // 그룹핑된 데이터에서 해당 직책의 모든 세부항목들을 가져오기
    const groupedPosition = getPositionData(row.positionId);
    
    // 원본 데이터에서 해당 positionId의 첫 번째 항목 찾기
    const originalItem = originalData.find(item => item.positionId === row.positionId);

    // 다이얼로그에서 사용할 수 있는 형태로 데이터 변환
    const dialogData = groupedPosition && originalItem ? {
      id: originalItem.id,
      classification: groupedPosition.classification,
      positionId: groupedPosition.positionId,
      positionName: groupedPosition.positionName,
      responsibilityOverview: groupedPosition.responsibilityOverview,
      responsibilityStartDate: groupedPosition.responsibilityStartDate,
      lastModifiedDate: groupedPosition.lastModifiedDate,
      createdAt: groupedPosition.createdAt,
      updatedAt: groupedPosition.updatedAt,
      // 공통 항목들은 그룹에서 직접 가져오기
      responsibilityContent: groupedPosition.responsibility_conent || '', // 책무 내용
      relatedBasis: groupedPosition.responsibility_rel_evid || '', // 관련 근거
      // 개별 항목들은 details[0]에서 가져오기
      keyManagementTasks: groupedPosition.details[0]?.responsibility_mgt_sts || '', // 주요 관리업무
      // 모든 세부항목들을 포함
      allDetails: groupedPosition.details
    } : null;

    setSelectedDetailData(dialogData);
    setDialogMode('view');
    setDialogOpen(true);
  };

  // 수정 저장 핸들러
  const handleSave = async () => {
    try {
      // TODO: API 호출로 데이터 저장

      // 목록 새로고침
      await fetchData();
    } catch (err) {
      setErrorMessage('데이터 저장에 실패했습니다.');
      setErrorDialogOpen(true);
    }
  };

  // 엑셀 업로드 핸들러
  const handleExcelUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        // 임시로 성공 메시지만 표시
        alert('엑셀 업로드가 완료되었습니다. (테스트용)');
      }
    };
    input.click();
  };

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = async () => {
    try {
      // 임시로 성공 메시지만 표시
      alert('엑셀 다운로드가 완료되었습니다. (테스트용)');
    } catch (err) {
      setErrorMessage('엑셀 다운로드에 실패했습니다.');
      setErrorDialogOpen(true);
    }
  };

  // 변경이력 핸들러
  const handleChangeHistory = async () => {
    if (selectedIds.length === 0) {
      setErrorMessage('변경이력을 확인할 항목을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    // 임시로 성공 메시지만 표시
    alert('변경이력 조회가 완료되었습니다. (테스트용)');
  };

  // 행 선택 핸들러
  const handleRowSelectionChange = (selectedRowIds: (string | number)[], selectedData: GroupedPositionResponsibilityRow[]) => {
    setSelectedIds(selectedRowIds.map(Number));
  };

  // 오류 다이얼로그 닫기
  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

  return (
    <PageContainer
      sx={{
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <PageHeader
        title="[400] 직책별 책무 현황"
        icon={<GroupsIcon />}
        description="직책별 책무 현황을 조회하고 관리합니다."
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
          minHeight: 0,
          position: 'relative', // 좌우 패딩을 3으로 수정
          py: 1,
          px: 0,
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
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>책무번호</span>
          <LedgerOrderSelect
            value={selectedLedgerOrder}
            onChange={setSelectedLedgerOrder}
            size='small'
            sx={{ minWidth: 150, maxWidth: 200 }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>직책</span>
          {/* <ComboBox
            value={positionFilter}
            onChange={(value) => setPositionFilter(value as string)}
            size="small"
            sx={{ minWidth: '200px' }}
          /> */}
          <PositionSelect
            value={selectedPosition}
            onChange={setSelectedPosition}
            size="small"
            sx={{ minWidth: '200px' }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={fetchData}
            color="primary"
          >
            조회
          </Button>
        </Box>

        {/* 액션 버튼 영역 */}
        <Box
          sx={{
            display: 'flex',
            gap: '8px',
            marginBottom: '6px',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={handleExcelUpload}
            color="success"
          >
            엑셀 업로드
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleExcelDownload}
            color="success"
          >
            엑셀 다운로드
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleChangeHistory}
            color="warning"
          >
            변경 이력
          </Button>
          {/* <Button
            variant="contained"
            size="small"
            onClick={() => {
              setDialogMode('create');
              setSelectedDetailData(null);
              setDialogOpen(true);
            }}
            color="primary"
          >
            등록
          </Button> */}
        </Box>

        {/* 그리드 영역 */}
        <Box sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          <DataGrid
            data={rows}
            columns={columns}
            loading={loading}
            error={error}
            selectable
            multiSelect={false}
            selectedRows={selectedIds}
            onRowSelectionChange={(selectedRows: (string | number)[], selectedData: GroupedPositionResponsibilityRow[]) => {
              setSelectedIds(selectedRows.map(Number));
            }}
            rowIdField="positionId"
          />
        </Box>
      </PageContent>

      {/* 상세 다이얼로그 */}
      <PositionResponsibilityDialog
        open={dialogOpen}
        positionName={selectedDetailData?.positionName || ''}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
        responsibilityId={selectedDetailData?.id || null}
        rowData={selectedDetailData} // row 데이터 전달
        onSave={handleSave}
        onChangeMode={setDialogMode}
      />

      {/* 오류 다이얼로그 */}
      <ErrorDialog
        open={errorDialogOpen}
        onClose={handleCloseErrorDialog}
        errorMessage={errorMessage}
      />
    </PageContainer>
  );
};

export default PositionResponsibilityStatusPage;
