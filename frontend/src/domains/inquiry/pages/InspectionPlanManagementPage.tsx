/**
 * 점검 계획 관리 페이지
 * 책무구조 원장 관리 - 점검 계획 관리
 */
import {
  Box,
  Chip
} from '@mui/material';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import React, { useCallback, useEffect, useState } from 'react';

import ErrorDialog from '../../../app/components/ErrorDialog';
import '../../../assets/scss/style.css';

interface IInspectionPlanManagementPageProps {
  className?: string;
}

interface InspectionPlanRow {
  id: number;
  planCode: string;              // 점검 계획 코드
  roundName: string;             // 점검 회차명
  inspectionPeriod: string;      // 점검 기간
  targetItemCount: number;       // 대상 점검항목 수
  isModified: boolean;           // 수정여부
  progressStatus: string;        // 진행상태
  inspectionTarget: string;      // 점검 대상 선정
  remarks?: string;              // 비고
}

const InspectionPlanManagementPage: React.FC<IInspectionPlanManagementPageProps> = (): React.JSX.Element => {
  console.log('🏗️ [InspectionPlanManagementPage] 컴포넌트 렌더링 시작');

  // 기간 선택 상태
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // 점검 계획 데이터
  const [planRows, setPlanRows] = useState<InspectionPlanRow[]>([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState<number[]>([]);

  // 선택된 상세 정보
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<InspectionPlanRow | null>(null);

  // 선택된 행 ID
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  // 등록 모드 상태
  const [isRegistrationMode, setIsRegistrationMode] = useState<boolean>(false);

  // 수정 모드 상태
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // 등록 폼 데이터
  const [registrationData, setRegistrationData] = useState({
    planCode: '',
    roundName: '',
    inspectionPeriod: '',
    inspectionTarget: '',
    remarks: ''
  });

  // 수정 폼 데이터
  const [editData, setEditData] = useState({
    planCode: '',
    roundName: '',
    inspectionPeriod: '',
    inspectionTarget: '',
    remarks: ''
  });

  // 오류 다이얼로그 상태
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchInspectionPlans = useCallback(async () => {
    try {
      // 임시 테스트 데이터 - 점검 계획
      const planTestData: InspectionPlanRow[] = [
        {
          id: 1,
          planCode: 'IP-2024-001',
          roundName: '1차 정기점검',
          inspectionPeriod: '2024-03-15 ~ 2024-03-22',
          targetItemCount: 25,
          isModified: false,
          progressStatus: '계획',
          inspectionTarget: '리스크관리부, 준법지원부',
          remarks: '분기별 정기점검'
        },
        {
          id: 2,
          planCode: 'IP-2024-002',
          roundName: '특별점검-컴플라이언스',
          inspectionPeriod: '2024-03-20 ~ 2024-03-27',
          targetItemCount: 18,
          isModified: true,
          progressStatus: '진행중',
          inspectionTarget: '준법지원부, 내부통제부',
          remarks: '규정 준수 점검'
        },
        {
          id: 3,
          planCode: 'IP-2024-003',
          roundName: '2차 정기점검',
          inspectionPeriod: '2024-04-01 ~ 2024-04-08',
          targetItemCount: 32,
          isModified: false,
          progressStatus: '계획',
          inspectionTarget: '신용관리부, 여신심사부',
          remarks: '신용리스크 점검'
        },
        {
          id: 4,
          planCode: 'IP-2024-004',
          roundName: '수시점검-운영',
          inspectionPeriod: '2024-04-10 ~ 2024-04-12',
          targetItemCount: 12,
          isModified: true,
          progressStatus: '완료',
          inspectionTarget: '운영지원부',
          remarks: '운영 프로세스 점검'
        }
      ];

      // 기간 필터링 적용
      let filteredData = planTestData;

      if (startDate || endDate) {
        filteredData = filteredData.filter(item => {
          const periodMatch = item.inspectionPeriod.includes(startDate) ||
                            item.inspectionPeriod.includes(endDate) ||
                            (!startDate && !endDate);
          return periodMatch;
        });
      }

      setPlanRows(filteredData);
    } catch (err) {
      console.error('점검 계획 데이터 로딩 실패:', err);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchInspectionPlans();
  }, [fetchInspectionPlans]);

  // 점검 계획 테이블 컬럼
  const planColumns: GridColDef[] = [
    {
      field: 'planCode',
      headerName: '점검계획 코드',
      flex: 1,
      minWidth: 130,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'roundName',
      headerName: '점검 회차명',
      flex: 1.2,
      minWidth: 150,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'inspectionPeriod',
      headerName: '점검 기간',
      flex: 1.3,
      minWidth: 160,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'targetItemCount',
      headerName: '대상 점검항목 수',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        return `${params.value}개`;
      }
    },
    {
      field: 'isModified',
      headerName: '수정여부',
      flex: 0.8,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? '수정' : '미수정'}
          color={params.value ? 'warning' : 'success'}
          size="small"
        />
      )
    },
    {
      field: 'progressStatus',
      headerName: '진행상태',
      flex: 0.8,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

        switch (params.value) {
          case '계획':
            color = 'info';
            break;
          case '진행중':
            color = 'warning';
            break;
          case '완료':
            color = 'success';
            break;
          case '중단':
            color = 'error';
            break;
          default:
            color = 'default';
        }

        return (
          <Chip
            label={params.value}
            color={color}
            size="small"
          />
        );
      }
    }
  ];

  const handlePlanRowSelectionModelChange = (newSelection: GridRowSelectionModel) => {
    setSelectedPlanIds(newSelection as number[]);
  };

  const handlePlanRowClick = (params: any) => {
    setSelectedPlanDetail(params.row);
    setSelectedRowId(params.row.id);
    setIsRegistrationMode(false); // 행 클릭 시 등록 모드 해제
    setIsEditMode(false); // 행 클릭 시 수정 모드 해제
  };

  const handleRegistrationClick = () => {
    setIsRegistrationMode(true);
    setIsEditMode(false); // 수정 모드 해제
    setSelectedPlanDetail(null); // 상세 표시 해제
    setSelectedRowId(null); // 선택된 행 해제
  };

  const handleRegistrationCancel = () => {
    setIsRegistrationMode(false);
    setRegistrationData({
      planCode: '',
      roundName: '',
      inspectionPeriod: '',
      inspectionTarget: '',
      remarks: ''
    });
  };

  const handleRegistrationSave = () => {
    // 필수 필드 유효성 검사
    if (!registrationData.planCode.trim()) {
      setErrorMessage('점검 계획 코드를 입력해주세요.');
      setErrorDialogOpen(true);
      return;
    }
    if (!registrationData.roundName.trim()) {
      setErrorMessage('점검 회차명을 입력해주세요.');
      setErrorDialogOpen(true);
      return;
    }
    if (!registrationData.inspectionPeriod.trim()) {
      setErrorMessage('점검 기간을 입력해주세요.');
      setErrorDialogOpen(true);
      return;
    }
    if (!registrationData.inspectionTarget.trim()) {
      setErrorMessage('점검 대상 선정을 입력해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    console.log('등록 데이터:', registrationData);
    // 실제 등록 로직 구현
    setIsRegistrationMode(false);
    setRegistrationData({
      planCode: '',
      roundName: '',
      inspectionPeriod: '',
      inspectionTarget: '',
      remarks: ''
    });
  };

  const handleRegistrationInputChange = (field: string, value: string | number | boolean) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditClick = () => {
    if (selectedPlanDetail) {
      setIsEditMode(true);
      setIsRegistrationMode(false); // 등록 모드 해제
      setEditData({
        planCode: selectedPlanDetail.planCode,
        roundName: selectedPlanDetail.roundName,
        inspectionPeriod: selectedPlanDetail.inspectionPeriod,
        inspectionTarget: selectedPlanDetail.inspectionTarget,
        remarks: selectedPlanDetail.remarks || ''
      });
    }
  };

  const handleEditCancel = () => {
    setIsEditMode(false);
    setEditData({
      planCode: '',
      roundName: '',
      inspectionPeriod: '',
      inspectionTarget: '',
      remarks: ''
    });
  };

  const handleEditSave = () => {
    // 필수 필드 유효성 검사
    if (!editData.planCode.trim()) {
      setErrorMessage('점검 계획 코드를 입력해주세요.');
      setErrorDialogOpen(true);
      return;
    }
    if (!editData.roundName.trim()) {
      setErrorMessage('점검 회차명을 입력해주세요.');
      setErrorDialogOpen(true);
      return;
    }
    if (!editData.inspectionPeriod.trim()) {
      setErrorMessage('점검 기간을 입력해주세요.');
      setErrorDialogOpen(true);
      return;
    }
    if (!editData.inspectionTarget.trim()) {
      setErrorMessage('점검 대상 선정을 입력해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    console.log('수정 데이터:', editData);
    // 실제 수정 로직 구현

    // 선택된 상세 정보 업데이트
    if (selectedPlanDetail) {
      const updatedDetail = {
        ...selectedPlanDetail,
        planCode: editData.planCode,
        roundName: editData.roundName,
        inspectionPeriod: editData.inspectionPeriod,
        inspectionTarget: editData.inspectionTarget,
        remarks: editData.remarks
      };
      setSelectedPlanDetail(updatedDetail);

      // 테이블 데이터도 업데이트
      setPlanRows(prev => prev.map(row =>
        row.id === selectedPlanDetail.id ? updatedDetail : row
      ));
    }

    setIsEditMode(false);
    setEditData({
      planCode: '',
      roundName: '',
      inspectionPeriod: '',
      inspectionTarget: '',
      remarks: ''
    });
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleErrorDialogClose = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

  // 점검 대상 선정 선택 핸들러 (임시)
  const handleSelectInspectionTarget = (mode: 'registration' | 'edit' | 'detail') => {
    // TODO: 실제 팝업/다이얼로그 구현 필요
    // 예시: prompt로 임시 구현
    const selected = window.prompt('점검 대상을 입력하세요 (예: 리스크관리부, 준법지원부)');
    if (selected !== null) {
      if (mode === 'registration') {
        setRegistrationData(prev => ({ ...prev, inspectionTarget: selected }));
      } else if (mode === 'edit') {
        setEditData(prev => ({ ...prev, inspectionTarget: selected }));
      }
      // detail 모드는 일반적으로 선택 불가, 필요시 구현
    }
  };

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      p: 2,
      gap: 2,
    }}>
      {/* 검색 조건 */}
      <Box sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        p: 2,
        backgroundColor: 'background.paper',
        borderRadius: 1,
      }}>
        {/* 기존 검색 조건 컴포넌트들 */}
      </Box>

      {/* 버튼 그룹 */}
      <Box sx={{
        display: 'flex',
        gap: 1,
        justifyContent: 'flex-end',
      }}>
        {/* 기존 버튼들 */}
      </Box>

      {/* 데이터 그리드 */}
      <Box sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        borderRadius: 1,
        overflow: 'hidden',
      }}>
        <DataGrid
          rows={planRows}
          columns={planColumns}
          onRowSelectionModelChange={handlePlanRowSelectionModelChange}
          onRowClick={handlePlanRowClick}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Box>

      {/* 에러 다이얼로그 */}
      <ErrorDialog
        open={errorDialogOpen}
        errorMessage={errorMessage}
        onClose={handleErrorDialogClose}
      />
    </Box>
  );
};

export default InspectionPlanManagementPage;
