/**
 * 미흡상황 현황 페이지 컴포넌트
 * 컴플라이언스 체크 - 미흡상황 현황 관리
 */
import '@/assets/scss/style.css';
import { Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { ModernAlert } from '@/shared/components/modal';
import { SearchConditionPanel, LedgerOrdersHodSelect } from '@/shared/components/ui/form';
import DepartmentSearchBox, { type DepartmentSearchResult } from '@/shared/components/ui/form/DepartmentSearchBox';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Box, Chip } from '@mui/material';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { getAuditItemStatusList, type AuditItemStatusResponse } from '../api/auditItemApi';
import ImplementationResultDialog, { type ImplementationResultData } from '../components/ImplementationResultDialog';
import AuditResultDialog from '../components/AuditResultDialog';
import { useGetCodeName, getDepartmentNameSync, type Department } from '@/shared/utils/codeUtils';
import DepartmentApi from '@/domains/common/api/departmentApi';
import ApprovalActionButton from '@/shared/components/approval/ApprovalActionButton';
import { updateImplementationResultDialog } from '../api/deficiencyStatusApi';
import { useReduxState } from '@/app/store/use-store';

// LoginUser 타입 (로그인 API 응답에 맞춤)
interface LoginUser {
  userid: string;
  username: string;  // 직원명 (employee.emp_name)
  email: string;
  empNo: string;     // 사번 (users.emp_no)
  deptCd: string;    // 부서코드 (employee.dept_code)
  positionCode: string; // 직급코드 (employee.position_code)
  role?: string;
  accessibleMenus?: any[];
}

interface IDeficiencyStatusPageProps {
  className?: string;
}

// 미흡상황 데이터 타입 정의 (AuditItemStatusResponse 사용)
type DeficiencyRow = AuditItemStatusResponse & { 
  id: number | string;
  approvalSubmit?: string; // 가상 필드 (결재상신 버튼용)
};

const DeficiencyStatusPage: React.FC<IDeficiencyStatusPageProps> = (): React.JSX.Element => {
  // 로그인 사용자 정보 가져오기
  const { data: loginData } = useReduxState<LoginUser>('loginStore/login');
  const [rows, setRows] = useState<DeficiencyRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentSearchResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);


  // 부서 정보 상태
  const [departments, setDepartments] = useState<Department[]>([]);

  // Hook을 컴포넌트 레벨에서 호출
  const getCodeNameFn = useGetCodeName();

  // 오류 다이얼로그 상태
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 이행결과 작성 다이얼로그 상태
  const [implementationDialogOpen, setImplementationDialogOpen] = useState(false);
  const [selectedImplementationData, setSelectedImplementationData] = useState<ImplementationResultData | undefined>();

  // 개선계획 변경 다이얼로그 상태 (AuditResultDialog 사용)
  const [improvementDialogOpen, setImprovementDialogOpen] = useState(false);

  // 부서 정보 로드
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const deptList = await DepartmentApi.getAll();
        setDepartments(deptList);
      } catch (error) {
        console.error('부서 정보 로드 실패:', error);
      }
    };
    loadDepartments();
  }, []);

  // 데이터 로드 함수 (INS03 미흡 건만 조회)
  const fetchDeficiencies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // item-status API 호출 (auditResultStatusCd=INS03 기본값)
      const data = await getAuditItemStatusList({
        ledgerOrdersHod: selectedLedgerOrder === 'ALL' ? undefined : Number(selectedLedgerOrder),
        auditResultStatusCd: 'INS03' // 미흡 건만 조회
      });

      if (Array.isArray(data)) {
        // 백엔드 응답 데이터를 프론트엔드 형식에 맞게 매핑
        const mappedData = data.map(item => ({
          ...item,
          id: item.hodIcItemId || item.auditProgMngtDetailId, // ID 매핑
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
  }, [selectedLedgerOrder]);

  useEffect(() => {
    fetchDeficiencies();
  }, [fetchDeficiencies]);

  // 부서명 렌더링 함수
  const renderDepartmentCell = ({ value }: { value: string | number | undefined }) => 
    getDepartmentNameSync(departments, value as string) || '-';

  // 개선상태 렌더링 함수  
  const renderImpStatusCell = ({ value }: { value: string | number | undefined }) => {
    if (!value) return null;
    
    const codeValue = value as string;
    const codeName = getCodeNameFn('PLAN_IMP', codeValue);
    
    return (
      <Chip
        label={codeName || codeValue}
        color={
          codeValue === 'PLI05' ? 'success' :
            codeValue === 'PLI04' ? 'primary' :
              codeValue === 'PLI03' ? 'info' :
                codeValue === 'PLI02' ? 'warning' :
                  codeValue === 'PLI01' ? 'default' : 'default'
        }
        size="small"
      />
    );
  };

  // 점검자 렌더링 함수
  const renderAuditorCell = ({ value }: { value: string | number | undefined }) => (value as string) || '미지정';

  // 결재상태 렌더링 함수
  const renderApprovalStatusCell = ({ value }: { value: string | number | undefined }) => {
    if (!value) return '-';
    
    const codeValue = value as string;
    const codeName = getCodeNameFn('APPR_STAT_CD', codeValue);
    
    return (
      <Chip
        label={codeName || codeValue}
        color={
          codeValue === 'APPROVED' ? 'success' :
            codeValue === 'PENDING' ? 'warning' :
              codeValue === 'REJECTED' ? 'error' :
                codeValue === 'DRAFT' ? 'default' : 'default'
        }
        size="small"
      />
    );
  };

  // 결재상신 버튼 렌더링 함수
  const renderApprovalCell = ({ row }: { row: DeficiencyRow }) => {
    // imp_pl_status_cd가 'PLI02'인 경우에만 버튼 표시
    if (row.impPlStatusCd === 'PLI02' || row.impPlStatusCd === 'PLI03') {
      return (
        <ApprovalActionButton
          taskType="audit_prog_mngt_detail"
          taskId={Number(row.auditProgMngtDetailId)}
          taskTitle={`미흡상황 - ${row.auditResult || '미흡사항'}`}
          currentUserId={loginData?.userid || 'unknown'}
          onApprovalStateChange={() => {
            // 결재 상태 변경 시 데이터 새로고침
            fetchDeficiencies();
          }}
          variant="outlined"
        />
      );
    }
    return null;
  };

  // 이행결과 셀 렌더링 함수
  const renderImplementationResultCell = ({ value }: { value: string | number | undefined }) => (
    <span style={{
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '200px',
      display: 'block'
    }}>
      {(value as string) || '-'}
    </span>
  );

  // 작성일자 셀 렌더링 함수
  const renderWriteDateCell = ({ value }: { value: string | number | undefined }) => 
    value ? dayjs(value as string).format('YYYY.MM.DD') : '-';

  // 컬럼 정의
  const columns: DataGridColumn<DeficiencyRow>[] = [
    {
      field: 'deptCd',
      headerName: '부서',
      width: 100,
      renderCell: renderDepartmentCell,
    },
    {
      field: 'impPlStatusCd',
      headerName: '개선상태',
      width: 150,
      renderCell: renderImpStatusCell,
    },
    {
      field: 'auditMenId',
      headerName: '점검자',
      width: 90,
      renderCell: renderAuditorCell,
    },
    {
      field: 'approvalStatusCd' as keyof DeficiencyRow,
      headerName: '결재상태',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: renderApprovalStatusCell,
    },
    {
      field: 'approvalSubmit' as keyof DeficiencyRow,
      headerName: '결재상신',
      width: 200,
      align: 'center',
      headerAlign: 'center',
      renderCell: renderApprovalCell,
      sortable: false,
    },
    {
      field: 'auditResult',
      headerName: '미흡사항',
      width: 190,
      flex: 1,
      renderCell: ({ value }) => value || '-'
    },
    {
      field: 'auditDetailContent' as keyof DeficiencyRow,
      headerName: '개선계획',
      width: 190,
      flex: 1,
      renderCell: ({ value }) => value || '-'
    },
    {
      field: 'auditDoneContent',
      headerName: '이행결과',
      width: 190,
      flex: 1,
      renderCell: renderImplementationResultCell,
    },
    {
      field: 'auditDoneDt' as keyof DeficiencyRow,
      headerName: '작성일자',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: renderWriteDateCell,
    },
    {
      field: 'auditFinalResultYn' as keyof DeficiencyRow,
      headerName: '점검 및 이행완료',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Chip
          label={value === 'Y' ? '완료' : '진행중'}
          color={value === 'Y' ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
  ];

  // 조회 버튼 클릭 핸들러
  const handleSearch = () => {
    fetchDeficiencies();
  };

  // 결재상신 버튼 클릭 핸들러 (ApprovalActionButton에서 자동 처리)
  // const handleApprovalSubmit = (row: DeficiencyRow) => {
  //   // ApprovalActionButton이 자동으로 결재상신을 처리합니다.
  // };

  // 개선계획 변경 버튼 클릭 핸들러
  const handleImprovementPlanChange = () => {
    if (selectedIds.length === 0) {
      setErrorMessage('개선계획을 변경할 항목을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    // 선택된 항목들의 impPlStatusCd 검증
    const selectedRows = rows.filter(row => selectedIds.includes(row.id as number));
    const invalidRows = selectedRows.filter(row => row.impPlStatusCd !== 'PLI01');
    
    if (invalidRows.length > 0) {
      setErrorMessage('개선계획 변경은 계획수립(PLI01) 상태인 항목만 가능합니다.');
      setErrorDialogOpen(true);
      return;
    }

    // AuditResultDialog 열기
    setImprovementDialogOpen(true);
  };

  // 이행결과 작성 버튼 클릭 핸들러
  const handleImplementationWrite = () => {
    if (selectedIds.length === 0) {
      setErrorMessage('이행결과를 작성할 항목을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    // 선택된 항목들의 impPlStatusCd 검증 (PLI01만 작성 가능)
    const selectedRows = rows.filter(row => selectedIds.includes(row.id as number));
    const invalidRows = selectedRows.filter(row => row.impPlStatusCd !== 'PLI01');
    
    if (invalidRows.length > 0) {
      setErrorMessage('이행결과 작성은 계획수립(PLI01) 상태인 항목만 가능합니다.');
      setErrorDialogOpen(true);
      return;
    }

    // 선택된 첫 번째 항목의 데이터 가져오기
    const selectedRow = rows.find(row => row.id === selectedIds[0]);
    if (selectedRow) {
      
      const implementationData: ImplementationResultData = {
        id: selectedRow.auditProgMngtDetailId || 0,  // auditProgMngtDetailId를 id로 사용
        auditProgMngtId: selectedRow.auditProgMngtDetailId || 0,  // 점검계획 ID 추가
        deficiencyContent: selectedRow.auditResult || '',
        improvementPlan: selectedRow.impPlStatusCd || '',
        auditDetailContent: selectedRow.auditDetailContent || '',
        auditDoneContent: selectedRow.auditDoneContent || '',
        auditDoneDt: selectedRow.auditDoneDt || '',
        implementationStatus: '완료',
      };
      setSelectedImplementationData(implementationData);
      setImplementationDialogOpen(true);
    }
  };

  // 오류 다이얼로그 닫기
  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

  // 이행결과 저장 핸들러
  const handleImplementationSave = async (data: ImplementationResultData) => {
    try {
      
      // auditProgMngtDetailId 검증
      const auditProgMngtDetailId = Number(data.id);
      if (!auditProgMngtDetailId || auditProgMngtDetailId <= 0) {
        throw new Error('유효하지 않은 점검계획상세 ID입니다.');
      }


      // 새로운 API 호출: audit_done_content 업데이트, imp_pl_status_cd를 PLI02로 변경      
      const response = await updateImplementationResultDialog({
        auditProgMngtDetailId: auditProgMngtDetailId,
        auditDoneContent: data.auditDoneContent
      });

      if (response.success) {
        
        // 성공 시 데이터 다시 로드
        await fetchDeficiencies();

        // 선택 해제
        setSelectedIds([]);
      } else {
        throw new Error(response.message || '이행결과 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('이행결과 저장 오류:', error);
      throw error;
    }
  };

  // 이행결과 다이얼로그 닫기
  const handleImplementationDialogClose = () => {
    setImplementationDialogOpen(false);
    setSelectedImplementationData(undefined);
  };

  // 선택된 항목들을 AuditItemInfo 형태로 변환
  const getSelectedAuditItems = () => {
    const selectedRows = rows.filter(row => selectedIds.includes(row.id as number));
    return selectedRows.map(row => ({
      hodIcItemId: row.hodIcItemId,
      auditProgMngtDetailId: row.auditProgMngtDetailId,
      responsibilityContent: row.responsibilityContent,
      responsibilityDetailContent: row.responsibilityDetailContent,
      positionsNm: row.positionsNm,
      deptCd: row.deptCd,
      fieldTypeCd: row.fieldTypeCd,
      roleTypeCd: row.roleTypeCd,
      icTask: row.icTask,
    }));
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
        {/* 검색 조건 영역 */}
        <SearchConditionPanel disabled={loading}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', whiteSpace: 'nowrap' }}>점검회차</span>
            <LedgerOrdersHodSelect
              value={selectedLedgerOrder}
              onChange={setSelectedLedgerOrder}
              size="small"
              disabled={loading}
              sx={{ minWidth: '200px' }}
            />
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px', whiteSpace: 'nowrap' }}>부서</span>
            <DepartmentSearchBox
              value={departmentFilter}
              onChange={setDepartmentFilter}
              size="small"
              placeholder="부서 선택"
              disabled={loading}
              sx={{ minWidth: '200px' }}
            />
          </Box>
          <Button
            preset="search"
            onClick={handleSearch}
            loading={loading}
          />
        </SearchConditionPanel>

        {/* 버튼 영역 */}
        <Box sx={{
          display: 'flex',
          gap: 1,
          marginBottom: '8px',
          justifyContent: 'flex-end'
        }}>
          <Button
            variant="outlined"
            onClick={handleImprovementPlanChange}
            disabled={loading}
          >
            개선계획 변경
          </Button>
          <Button
            variant="outlined"
            onClick={handleImplementationWrite}
            disabled={loading}
          >
            이행결과 작성
          </Button>
        </Box>

        {/* 그리드 영역 */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <DataGrid
            data={rows}
            columns={columns}
            loading={loading}
            error={error}
            height={600}
            selectedRows={selectedIds}
            selectable={true}
            multiSelect={false}
            disableColumnSort={true}
            onRowSelectionChange={(selectedIds: (string | number)[], _selectedData: DeficiencyRow[]) => {
              setSelectedIds(selectedIds.map(id => Number(id)));
            }}
          />
        </Box>

        {/* 모던 에러 알림 다이얼로그 */}
        <ModernAlert
          open={errorDialogOpen}
          severity="error"
          title="오류"
          message={errorMessage}
          onConfirm={handleCloseErrorDialog}
          onClose={handleCloseErrorDialog}
        />

        {/* 이행결과 작성 다이얼로그 */}
        <ImplementationResultDialog
          open={implementationDialogOpen}
          onClose={handleImplementationDialogClose}
          data={selectedImplementationData}
          onSave={handleImplementationSave}
          mode="edit"
        />

        {/* 개선계획 변경 다이얼로그 (AuditResultDialog 재사용) */}
        <AuditResultDialog
          open={improvementDialogOpen}
          mode="edit"
          onClose={() => {
            setImprovementDialogOpen(false);
            setSelectedIds([]);
            // 저장 후 데이터 새로고침
            fetchDeficiencies();
          }}
          selectedItems={getSelectedAuditItems()}
          loading={loading}
        />
      </PageContent>
    </PageContainer>
  );
};

export default DeficiencyStatusPage;