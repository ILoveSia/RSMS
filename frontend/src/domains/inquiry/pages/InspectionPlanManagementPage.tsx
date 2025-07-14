/**
 * 점검 계획 관리 페이지
 * 책무구조 원장 관리 - 점검 계획 관리
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { DataGrid } from '@/shared/components/ui/';
import { Button } from '@/shared/components/ui/button';
import { ComboBox, DatePicker } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn, SelectOption } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Box, Chip, TextField, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import InspectionPlanManagementDialog from '../components/InspectionPlanManagementDialog';
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

interface RegistrationData {
  planCode: string;
  roundName: string;
  inspectionStartDate: Date;
  inspectionEndDate: Date;
  inspectionTarget: SelectOption | null;
  remarks: string;
}

// 초기 등록 데이터
const initialRegistrationData: RegistrationData = {
  planCode: '',
  roundName: '',
  inspectionStartDate: new Date(),
  inspectionEndDate: new Date(),
  inspectionTarget: null,
  remarks: ''
};

// 초기 수정 데이터
const initialEditData: RegistrationData = {
  planCode: '',
  roundName: '',
  inspectionStartDate: new Date(),
  inspectionEndDate: new Date(),
  inspectionTarget: null,
  remarks: ''
};

const InspectionPlanManagementPage: React.FC<IInspectionPlanManagementPageProps> = React.memo((): React.JSX.Element => {
  // 기간 선택 상태
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [ledgerOrder, setLedgerOrder] = useState<string>('2024-001');

  // 원장차수 옵션
  const ledgerOrderOptions: SelectOption[] = [
    { value: '2024-001', label: '2024-001' },
    { value: '2024-002', label: '2024-002' },
    { value: '2024-003', label: '2024-003' }
  ];

  // 점검 계획 데이터
  const [planRows, setPlanRows] = useState<InspectionPlanRow[]>([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState<number[]>([]);

  // 등록/수정 모드
  const [isRegistrationMode, setIsRegistrationMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // 등록 폼 데이터
  const [registrationData, setRegistrationData] = useState<RegistrationData>(initialRegistrationData);

  // 수정 폼 데이터
  const [editData, setEditData] = useState<RegistrationData>(initialEditData);

  // 오류 다이얼로그 상태
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  const fetchInspectionPlans = useCallback(async () => {
    try {
      setIsLoading(true);
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

      setPlanRows(planTestData);
    } catch (err) {
      console.error('점검 계획 데이터 로딩 실패:', err);
      setErrorMessage('점검 계획 데이터를 불러오는 데 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInspectionPlans();
  }, [fetchInspectionPlans]);

  // 점검 계획 테이블 컬럼
  const planColumns: DataGridColumn<InspectionPlanRow>[] = [
    {
      field: 'planCode',
      headerName: '점검계획 코드',
      flex: 1,
      minWidth: 150,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'roundName',
      headerName: '점검 회차명',
      flex: 1.3,
      minWidth: 200,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'inspectionPeriod',
      headerName: '점검 기간',
      flex: 1.3,
      minWidth: 200,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'targetItemCount',
      headerName: '대상 점검항목 수',
      flex: 1,
      minWidth: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => `${value}개`
    },
    {
      field: 'isModified',
      headerName: '수정여부',
      flex: 0.8,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Chip
          label={value ? '수정' : '미수정'}
          color={value ? 'warning' : 'success'}
          size="small"
        />
      )
    },
    {
      field: 'progressStatus',
      headerName: '진행상태',
      flex: 0.8,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => {
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

        switch (value) {
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
            label={value}
            color={color}
            size="small"
          />
        );
      }
    }
  ];

  // 등록 모드 전환
  const handleRegistrationModeToggle = () => {
    setIsRegistrationMode(!isRegistrationMode);
    if (!isRegistrationMode) {
      setIsEditMode(false);
      setSelectedPlanIds([]);
      setRegistrationData(initialRegistrationData);
      setEditData(initialEditData);
    }
  };

  // 수정 모드 전환
  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      setRegistrationData(initialRegistrationData);
      setIsRegistrationMode(false);
    }
  };

  // 옵션 데이터
  const planCodeOptions: SelectOption[] = [
    { value: 'IP-2024-001', label: 'IP-2024-001' },
    { value: 'IP-2024-002', label: 'IP-2024-002' },
    { value: 'IP-2024-003', label: 'IP-2024-003' },
  ];

  const roundNameOptions: SelectOption[] = [
    { value: '1차 정기점검', label: '1차 정기점검' },
    { value: '2차 정기점검', label: '2차 정기점검' },
    { value: '특별점검', label: '특별점검' },
  ];

  const inspectionTargetOptions: SelectOption[] = [
    { value: '리스크관리부', label: '리스크관리부' },
    { value: '준법지원부', label: '준법지원부' },
    { value: '내부통제부', label: '내부통제부' },
  ];

  // ComboBox 변경 핸들러
  const handleComboBoxChange = (
    field: keyof RegistrationData,
    value: SelectOption | null,
    setter: React.Dispatch<React.SetStateAction<RegistrationData>>
  ) => {
    setter(prev => ({ ...prev, [field]: value }));
  };

  // TextField 변경 핸들러
  const handleTextFieldChange = (
    field: keyof RegistrationData,
    value: string,
    setter: React.Dispatch<React.SetStateAction<RegistrationData>>
  ) => {
    setter(prev => ({ ...prev, [field]: value }));
  };

  // DatePicker 변경 핸들러
  const handleDateChange = (
    field: keyof RegistrationData,
    date: Date | null,
    setter: React.Dispatch<React.SetStateAction<RegistrationData>>
  ) => {
    if (date) {
      setter(prev => ({ ...prev, [field]: date }));
    }
  };

  // 폼 유효성 검사
  const validateForm = (data: RegistrationData): boolean => {
    if (!data.roundName) {
      setErrorMessage('점검 회차명을 입력해주세요.');
      setErrorDialogOpen(true);
      return false;
    }

    if (!data.inspectionStartDate) {
      setErrorMessage('점검 시작일을 선택해주세요.');
      setErrorDialogOpen(true);
      return false;
    }

    if (!data.inspectionEndDate) {
      setErrorMessage('점검 종료일을 선택해주세요.');
      setErrorDialogOpen(true);
      return false;
    }

    if (!data.inspectionTarget) {
      setErrorMessage('점검 대상을 선택해주세요.');
      setErrorDialogOpen(true);
      return false;
    }

    return true;
  };

  // 등록 처리
  const handleSubmit = async () => {
    if (!validateForm(registrationData)) {
      return;
    }

    try {
      setIsLoading(true);
      // 실제 등록 API 호출 구현

      setIsRegistrationMode(false);
      setRegistrationData(initialRegistrationData);

      await fetchInspectionPlans();
    } catch (err) {
      console.error('등록 실패:', err);
      setErrorMessage('등록에 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 수정 처리
  const handleUpdate = async () => {
    if (!validateForm(editData)) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('수정 데이터:', editData);
      // 실제 수정 API 호출 구현

      setIsEditMode(false);
      setEditData(initialEditData);

      await fetchInspectionPlans();
    } catch (err) {
      console.error('수정 실패:', err);
      setErrorMessage('수정에 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 삭제 처리
  const handleDelete = async () => {
    if (selectedPlanIds.length === 0) {
      setErrorMessage('삭제할 항목을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    if (!window.confirm('선택한 항목을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('삭제 대상:', selectedPlanIds);
      // 실제 삭제 API 호출 구현

      setSelectedPlanIds([]);
      await fetchInspectionPlans();
    } catch (err) {
      console.error('삭제 실패:', err);
      setErrorMessage('삭제에 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleErrorDialogClose = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

  return (
    <PageContainer
    sx={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      minHeight: 0,
    }}
    >
      <PageHeader
        title="[900] 점검 계획 관리"
        icon={<GroupsIcon />}
        description="점검 계획을 등록하고 관리합니다."
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


        {/* 기간 선택 영역 */}
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
          <ComboBox
            value={ledgerOrder}
            onChange={(value) => setLedgerOrder(value as string)}
            options={ledgerOrderOptions}
            size="small"
            sx={{ minWidth: '200px' }}
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <DatePicker
              label="시작일"
              value={startDate}
              onChange={setStartDate}
              size="small"
              sx={{ width: '200px' }}
            />
            <span style={{ color: 'var(--bank-text-primary)' }}>~</span>
            <DatePicker
              label="종료일"
              value={endDate}
              onChange={setEndDate}
              size="small"
              sx={{ width: '200px' }}
            />
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={fetchInspectionPlans}
            color="primary"
          >
            조회
          </Button>
        </Box>

        {/* 상단 버튼 영역 */}
        <Box sx={{
          display: 'flex',
          gap: 1,
          marginBottom: 2,
          justifyContent: 'flex-end'  // 오른쪽 정렬 추가
        }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleRegistrationModeToggle}
            disabled={isLoading}
          >
            등록
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleDelete}
            color="error"
            disabled={selectedPlanIds.length === 0 || isLoading}
            style={{ color: 'white' }}
          >
            삭제
          </Button>
        </Box>

        {/* 데이터 그리드 */}
        <Box sx={{
          height: 400,
          width: '100%',
          backgroundColor: 'var(--bank-surface)',
          border: '1px solid var(--bank-border)',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <DataGrid
            data={planRows}
            columns={planColumns}
            loading={isLoading}
            selectable
            multiSelect
            selectedRows={selectedPlanIds}
            onRowSelectionChange={(newSelection) => {
              setSelectedPlanIds(newSelection as number[]);
            }}
            rowIdField="id"
            height={400}
            disableColumnMenu
            disableColumnFilter
            disableRowSelectionOnClick={false}
            noDataMessage="데이터가 없습니다."
          />
        <InspectionPlanManagementDialog
          open={isRegistrationMode}
          onClose={handleRegistrationModeToggle}
          onSubmit={handleSubmit}
          loading={isLoading}
          registrationData={registrationData}
          setRegistrationData={setRegistrationData}
          inspectionTargetOptions={inspectionTargetOptions}
        />
        </Box>
        {/* 등록 폼 */}
        {isRegistrationMode && (
          <Box
            id="registration-section"
            sx={{
              marginTop: '20px',
              backgroundColor: 'var(--bank-bg-secondary)',
              border: '1px solid var(--bank-border)',
              borderRadius: '4px',
              padding: '16px'
            }}
          >
            <Typography variant="h6" sx={{
              fontWeight: 'bold',
              marginBottom: '16px',
              fontSize: '0.95rem',
              color: 'var(--bank-text-primary)'
            }}>
              점검 계획 등록
            </Typography>

            <Box sx={{
              border: '1px solid var(--bank-border)',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              padding: '16px',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '16px',
              alignItems: 'center'
            }}>
              {/* 점검 회차 */}
              <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
                점검 회차
              </Typography>
              <TextField
                value={registrationData.roundName}
                onChange={(e) => handleTextFieldChange('roundName', e.target.value, setRegistrationData)}
                size="small"
                fullWidth
              />

              {/* 점검 기간 */}
              <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
                점검 기간
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <DatePicker
                  value={registrationData.inspectionStartDate}
                  onChange={(date) => handleDateChange('inspectionStartDate', date, setRegistrationData)}
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '40px'
                    }
                  }}
                />
                <Typography>~</Typography>
                <DatePicker
                  value={registrationData.inspectionEndDate}
                  onChange={(date) => handleDateChange('inspectionEndDate', date, setRegistrationData)}
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '40px'
                    }
                  }}
                />
              </Box>

              {/* 점검 대상 */}
              <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
                점검 대상
              </Typography>
              <ComboBox
                value={registrationData.inspectionTarget}
                onChange={(value) => handleComboBoxChange(
                  'inspectionTarget',
                  value as SelectOption | null,
                  setRegistrationData
                )}
                options={inspectionTargetOptions}
                placeholder="점검 대상을 선택하세요"
                size="small"
              />

              {/* 비고 */}
              <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
                비고
              </Typography>
              <TextField
                value={registrationData.remarks}
                onChange={(e) => handleTextFieldChange('remarks', e.target.value, setRegistrationData)}
                size="small"
                fullWidth
                multiline
                rows={3}
              />
            </Box>

            {/* 저장/취소 버튼 */}
            <Box sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'flex-end',
              marginTop: '16px'
            }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleSubmit}
                color="primary"
                disabled={isLoading}
              >
                등록
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleRegistrationModeToggle}
                disabled={isLoading}
              >
                취소
              </Button>
            </Box>
          </Box>
        )}

        {/* 수정 폼 */}
        {isEditMode && (
          <Box sx={{
            marginTop: '20px',
            backgroundColor: 'var(--bank-bg-secondary)',
            border: '1px solid var(--bank-border)',
            borderRadius: '4px',
            padding: '16px'
          }}>
            <Typography variant="h6" sx={{
              fontWeight: 'bold',
              marginBottom: '16px',
              fontSize: '0.95rem',
              color: 'var(--bank-text-primary)'
            }}>
              점검 계획 수정
            </Typography>

            <Box sx={{
              border: '1px solid var(--bank-border)',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              padding: '16px',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '16px',
              alignItems: 'center'
            }}>
              {/* 점검 계획 코드 */}
              <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
                점검 계획 코드
              </Typography>
              <TextField
                value={editData.planCode}
                disabled
                size="small"
                fullWidth
              />

              {/* 점검 회차명 */}
              <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
                점검 회차명
              </Typography>
              <TextField
                value={editData.roundName}
                onChange={(e) => setEditData(prev => ({ ...prev, roundName: e.target.value }))}
                placeholder="점검 회차명을 입력하세요"
                size="small"
                fullWidth
              />

              {/* 점검 기간 */}
              <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
                점검 기간
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <DatePicker
                  value={editData.inspectionStartDate}
                  onChange={(date) => handleDateChange('inspectionStartDate', date, setEditData)}
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '40px'
                    }
                  }}
                />
                <Typography>~</Typography>
                <DatePicker
                  value={editData.inspectionEndDate}
                  onChange={(date) => handleDateChange('inspectionEndDate', date, setEditData)}
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '40px'
                    }
                  }}
                />
              </Box>

              {/* 점검 대상 */}
              <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
                점검 대상
              </Typography>
              <ComboBox
                value={editData.inspectionTarget}
                onChange={(value) => handleComboBoxChange(
                  'inspectionTarget',
                  value as SelectOption | null,
                  setEditData
                )}
                options={inspectionTargetOptions}
                placeholder="점검 대상을 선택하세요"
                size="small"
              />

              {/* 비고 */}
              <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
                비고
              </Typography>
              <TextField
                value={editData.remarks}
                onChange={(e) => setEditData(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="비고를 입력하세요"
                size="small"
                fullWidth
              />
            </Box>

            {/* 저장/취소 버튼 */}
            <Box sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'flex-end',
              marginTop: '16px'
            }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleUpdate}
                color="primary"
                disabled={isLoading}
              >
                수정
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleEditModeToggle}
                disabled={isLoading}
              >
                취소
              </Button>
            </Box>
          </Box>
        )}

      {/* 에러 다이얼로그 */}
      <ErrorDialog
        open={errorDialogOpen}
        errorMessage={errorMessage}
        onClose={handleErrorDialogClose}
      />
      </PageContent>
    </PageContainer>
  );
});

export default InspectionPlanManagementPage;
