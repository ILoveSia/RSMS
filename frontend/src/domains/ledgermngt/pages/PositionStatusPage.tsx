import DepartmentSearchPopup, { type Department } from '@/app/components/DepartmentSearchPopup';
import EmployeeSearchPopup, { type EmployeeSearchResult } from '@/app/components/EmployeeSearchPopup';
import { Confirm } from '@/shared/components/modal';
import { Button, DataGrid, Select } from '@/shared/components/ui';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Box } from '@mui/material';
import { type GridRowSelectionModel } from '@mui/x-data-grid';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import React, { useCallback, useEffect, useState } from 'react';
import '../../../assets/scss/style.css';
import { positionApi, type PositionStatusRow } from '../api/positionApi';
import PositionDialog from '../components/PositionDialog';

type DialogMode = 'create' | 'edit' | 'view';

interface IPositionStatusPageProps {
  className?: string;
}

const PositionStatusPage: React.FC<IPositionStatusPageProps> = React.memo((): React.JSX.Element => {
  // 기존 상태 관리 방식
  const [rows, setRows] = useState<PositionStatusRow[]>([]);
  const [ledgerOrderOptions, setLedgerOrderOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로컬 UI 상태
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<number[] | null>(null);

  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [positionDialogMode, setPositionDialogMode] = useState<DialogMode>('create');
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('');

  // 부서 검색 팝업 상태
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<PositionStatusRow | null>(null);

  // 직원 검색 팝업 상태
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);

  // 직원 선택 핸들러
  const handleEmployeeSelect = (employee: EmployeeSearchResult) => {
    if (selectedPosition) {
      // TODO: API 호출하여 선택된 직원 정보 업데이트
      console.log('Selected employee:', employee);
      console.log('For position:', selectedPosition);
    }
    setEmployeeSearchOpen(false);
  };

  // 직책 현황 조회
  const fetchPositionStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await positionApi.getStatusList();
      setRows(data);
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: string }).message === 'string'
      ) {
        setError((err as { message: string }).message);
      } else {
        setError('직책 현황을 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 원장차수 목록 조회
  const fetchLedgerOrders = useCallback(async () => {
    try {
      const data = await positionApi.getLedgerOrderSelectList();
      setLedgerOrderOptions(data);
    } catch (err: unknown) {
      console.error('원장차수 목록 조회 실패:', err);
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    fetchPositionStatus();
    fetchLedgerOrders();
  }, [fetchPositionStatus, fetchLedgerOrders]);

  // 부서 선택 핸들러
  const handleDepartmentSelect = (departments: Department | Department[]) => {
    if (selectedPosition) {
      // 단일 부서만 처리
      const department = Array.isArray(departments) ? departments[0] : departments;
      // TODO: API 호출하여 선택된 부서 정보 업데이트
      console.log('Selected department:', department);
      console.log('For position:', selectedPosition);
    }
    setDepartmentSearchOpen(false);
  };

  const positionColumns: DataGridColumn<PositionStatusRow>[] = [
    {
      field: 'positionsNm',
      headerName: '직책명',
      width: 200,
      flex: 1,
      renderCell: params => (
        <span
          style={{ color: 'var(--bank-primary)', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={e => {
            e.stopPropagation();
            handleRowClick(params.row.positionsId);
          }}
        >
          {params.value}
        </span>
      ),
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'ownerDeptNms',
      headerName: '소관부서',
      width: 300,
      align: 'center',
      headerAlign: 'center',
      flex: 2,
      renderCell: params => params.value || '-'
    },
    {
      field: 'writeDeptNm',
      headerName: '책무기술서 작성 부서',
      width: 200,
      flex: 2,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => (
        <span
          style={{ color: 'var(--bank-primary)', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={e => {
            e.stopPropagation();
            setSelectedPosition(params.row);
            setDepartmentSearchOpen(true);
          }}
        >
          {params.value || '부서 선택'}
        </span>
      ),
    },
    {
      field: 'adminCount',
      headerName: '관리자 수',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => (
        <span
          style={{ color: 'var(--bank-primary)', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={e => {
            e.stopPropagation();
            setSelectedPosition(params.row);
            setEmployeeSearchOpen(true);
          }}
        >
          {params.value || '0'}
        </span>
      ),
    },
  ];

  const handleSearch = () => {
    fetchPositionStatus();
  };

  const handleCreateClick = () => {
    setSelectedPositionId(null);
    setPositionDialogMode('create');
    setPositionDialogOpen(true);
  };

  const handlePositionDialogClose = () => {
    setPositionDialogOpen(false);
    setSelectedPositionId(null);
  };

  const handlePositionSave = () => {
    fetchPositionStatus();
  };

  const handlePositionModeChange = (newMode: DialogMode) => {
    setPositionDialogMode(newMode);
  };

  // DataGrid 체크박스 선택 핸들러
  const handleRowSelectionChange = (newSelection: GridRowSelectionModel) => {
    if (Array.isArray(newSelection)) {
      setSelectedIds(newSelection.map(Number));
    } else {
      setSelectedIds([]);
    }
  };

  // 삭제 버튼 클릭 시: 모달만 띄움
  const handleDelete = () => {
    if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
      setError('삭제할 항목을 선택하세요.');
      return;
    }
    setPendingDelete(selectedIds);
    setConfirmOpen(true);
  };

  // 삭제 확인 모달에서 "확인" 클릭 시 실제 삭제
  const handleConfirmDelete = async () => {
    if (!pendingDelete || pendingDelete.length === 0) {
      setConfirmOpen(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await positionApi.deleteBulk(pendingDelete);
      setSelectedIds([]); // 선택 초기화
      fetchPositionStatus(); // 목록 새로고침
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: string }).message === 'string'
      ) {
        setError((err as { message: string }).message);
      } else {
        setError('삭제 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  const handleRowClick = (positionsId: number) => {
    setSelectedPositionId(positionsId);
    setPositionDialogMode('view');
    setPositionDialogOpen(true);
  };

  // 엑셀 다운로드 핸들러 (ExcelJS 사용)
  const handleExcelDownload = async () => {
    if (!rows || rows.length === 0) {
      setError('엑셀로 내보낼 데이터가 없습니다.');
      return;
    }

    try {
      // ExcelJS 워크북 생성
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('직책 현황');

      // 헤더 설정
      const headers = ['직책ID', '직책명', '책무기술서 작성 부서', '소관부서', '관리자 수'];
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
          row.positionsId,
          row.positionsNm,
          row.writeDeptNm,
          row.ownerDeptNms,
          row.adminCount,
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
      saveAs(blob, `직책_현황_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      setError('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };

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
        title="[200] 직책 현황"
        icon={<GroupsIcon />}
        description="직책별 현황을 조회하고 관리합니다."
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
          <Select
            value={selectedLedgerOrder}
            onChange={value => setSelectedLedgerOrder(value as string)}
            size='small'
            sx={{ minWidth: 150, maxWidth: 200 }}
            options={[
              { value: '', label: '전체' },
              ...(ledgerOrderOptions.length > 0
                ? ledgerOrderOptions.map(option => ({
                    value: option.value,
                    label: option.label,
                  }))
                : [{ value: '', label: '데이터 로딩 중...', disabled: true }]),
            ]}
          />
          <Button variant='contained' size='small' onClick={handleSearch} color='primary'>
            조회
          </Button>
          <Button
            variant="contained"
            size="small"
            color="success"
            onClick={() => {
              /* 차수생성 로직 미구현 */
            }}
          >
            책무번호생성
          </Button>
          <Box sx={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <Button
              variant="contained"
              size="small"
              color="success"
              onClick={() => {
                /* 확정 로직 미구현 */
              }}
            >
              확정
            </Button>
            <Button
              variant="contained"
              size="small"
              color="error"
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
            variant="contained"
            size="small"
            color="success"
            onClick={handleExcelDownload}
            sx={{ mr: 1 }}
          >
            엑셀 다운로드
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={handleCreateClick}
            sx={{ mr: 1 }}
          >
            등록
          </Button>
          <Button variant='contained' size='small' onClick={handleDelete} color='error'>
            삭제
          </Button>
        </Box>
        <Box sx={{width: '100%' }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <DataGrid
            data={rows}
            columns={positionColumns.map(col => ({
              field: col.field,
              headerName: col.headerName,
              width: col.width,
              flex: col.flex,
              sortable: col.sortable,
              align: col.align,
              renderCell: col.renderCell,
            }))}
            loading={loading}
            selectable={true}
            multiSelect={true}
            selectedRows={selectedIds}
            onRowSelectionChange={selectedRows => {
              setSelectedIds(selectedRows.map(id => Number(id)));
            }}
            rowIdField='positionsId'
            sx={{
              width: '100%',
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
      <PositionDialog
        open={positionDialogOpen}
        mode={positionDialogMode}
        positionId={selectedPositionId}
        onClose={handlePositionDialogClose}
        onSave={handlePositionSave}
        onChangeMode={handlePositionModeChange}
      />
      <DepartmentSearchPopup
        open={departmentSearchOpen}
        onClose={() => setDepartmentSearchOpen(false)}
        onSelect={handleDepartmentSelect}
        multiSelect={false}
        title="책무기술서 작성 부서 선택"
      />
      <EmployeeSearchPopup
        open={employeeSearchOpen}
        onClose={() => setEmployeeSearchOpen(false)}
        onSelect={handleEmployeeSelect}
        title="관리자 선택"
      />
      <Confirm
        open={confirmOpen}
        title='삭제 확인'
        message='정말로 선택한 직책을 삭제하시겠습니까?'
        confirmText='삭제'
        cancelText='취소'
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
      />
    </PageContainer>
  );
});

export default PositionStatusPage;
