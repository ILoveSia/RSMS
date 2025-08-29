import { Box, Chip } from '@mui/material';
import ManagementButtonGroup from '@/shared/components/ui/button/ManagementButtonGroup';
import React, { useCallback, useEffect, useState } from 'react';
import LedgerOrderSelect from '@/shared/components/ui/form/LedgerOrderSelect';
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import type { DialogMode } from '@/shared/components/modal/BaseDialog';
import { SearchButton } from '@/shared/components/ui/button';
import { PermissionButton } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { PositionSearchBox } from '@/shared/components/ui/form';
import type { PositionSearchResult } from '@/domains/ledgermngt/api/positionApi';
import positionApi from '@/domains/ledgermngt/api/positionApi';
import { Confirm } from '@/shared/components/modal';
import { useApiWithNotification } from '@/shared/hooks';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import PositionResponsibilityDialog from '../components/PositionResponsibilityDialog';
import { useGetCodeName } from '@/shared/utils/codeUtils';
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
  // ledger_orders 관련 필드 추가
  ledger_orders_id?: number | null;
  ledger_orders_title?: string;
  ledger_orders_status_cd?: string;
  // approval 관련 필드 추가
  appr_stat_cd?: string;
  // role_resp_status 관련 필드 추가
  role_resp_status_id?: number | null;
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
  // ledger_orders 관련 필드 추가
  ledger_orders_id?: number | null;
  ledger_orders_title?: string;
  ledger_orders_status_cd?: string;
  // approval 관련 필드 추가
  appr_stat_cd?: string;
  // role_resp_status 관련 필드 추가
  role_resp_status_id?: number | null;
  // 개별 항목들만 details 배열에 (같은 직책 내에서도 다를 수 있는 값)
  details: Array<{
    responsibility_detail_content: string; // 세부내용
    responsibility_mgt_sts: string; // 주요 관리업무
    responsibility_id: string; // 책무 번호
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
  // ledger_orders 관련 필드 추가
  ledger_orders_id?: number | null;
  ledger_orders_title?: string;
  ledger_orders_status_cd?: string;
  // approval 관련 필드 추가
  appr_stat_cd?: string;
  // role_resp_status 관련 필드 추가
  role_resp_status_id?: number | null;
}

const PositionResponsibilityStatusPage: React.FC<IPositionResponsibilityStatusPageProps> = (): React.JSX.Element => {
  const [rows, setRows] = useState<GroupedPositionResponsibilityRow[]>([]);
  const [originalData, setOriginalData] = useState<PositionResponsibility[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedPositionResponsibility[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // API 알림 훅
  const { callApiWithNotification } = useApiWithNotification({
    showSuccessOnLoad: true,
  });

  // 필터 상태
  const [selectedPosition, setSelectedPosition] = useState<PositionSearchResult | null>(null);

  // 선택된 행
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('view');
  const [selectedDetailData, setSelectedDetailData] = useState<any>(null);
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('ALL');
  const [ledgerOrdersId, setLedgerOrdersId] = useState<number | undefined>(undefined);
  // LedgerOrder 옵션 목록을 저장할 state
  const [ledgerOrderOptions, setLedgerOrderOptions] = useState<Array<{value: string, label: string, ledgerOrdersId: number}>>([]);
  // 오류 다이얼로그 상태
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 확정/확정취소 관련 상태
  const [confirmConfirmOpen, setConfirmConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  
  // LedgerOrderSelect 새로고침 트리거
  const [ledgerOrderRefreshTrigger, setLedgerOrderRefreshTrigger] = useState<number>(0);



  const getCodeNameFn = useGetCodeName();
  // positions_id로 데이터 그룹화 함수
  const groupDataByPositionId = useCallback((data: PositionResponsibility[]): GroupedPositionResponsibility[] => {
    const groupMap = new Map<string, GroupedPositionResponsibility>();

    data.forEach(item => {
      const { id, positionId, positionName, createdAt, updatedAt, classification, responsibilityOverview } = item;

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
          // ledger_orders 필드 추가
          ledger_orders_id: item.ledger_orders_id,
          ledger_orders_title: item.ledger_orders_title,
          ledger_orders_status_cd: item.ledger_orders_status_cd,
          // approval 관련 필드 추가
          appr_stat_cd: (item as any).appr_stat_cd,
          // role_resp_status 관련 필드 추가
          role_resp_status_id: (item as any).role_resp_status_id,
          details: []
        });
      }

      const group = groupMap.get(positionId)!;
      // 개별 항목들만 details에 저장
      group.details.push({
        responsibility_detail_content: (item as any).responsibility_detail_content || '',
        responsibility_mgt_sts: (item as any).responsibility_mgt_sts || '',
        responsibility_id: (item as any).responsibility_id || '',
      });
    });

    return Array.from(groupMap.values());
  }, []);

  // 그룹핑된 데이터를 DataGrid용 행 데이터로 변환
  const convertToGridRows = useCallback((groupedData: GroupedPositionResponsibility[]): GroupedPositionResponsibilityRow[] => {
    return groupedData.map(group => {
      return {
        positionId: group.positionId,
        positionName: group.positionName,
        classification: group.classification, // 공통 항목으로 직접 사용
        responsibilityOverview: group.responsibilityOverview,
        responsibilityStartDate: group.responsibilityStartDate,
        lastModifiedDate: group.lastModifiedDate,
        detailCount: group.details.length,
        // ledger_orders 관련 필드 추가
        ledger_orders_id: group.ledger_orders_id,
        ledger_orders_title: group.ledger_orders_title,
        ledger_orders_status_cd: group.ledger_orders_status_cd,
        // approval 관련 필드 추가
        appr_stat_cd: group.appr_stat_cd,
        // role_resp_status 관련 필드 추가
        role_resp_status_id: group.role_resp_status_id,
      };
    });
  }, []);

  // 그룹화된 데이터 활용 함수들
  const getPositionData = useCallback((positionId: string): GroupedPositionResponsibility | undefined => {
    return groupedData.find(item => item.positionId === positionId);
  }, [groupedData]);

  // 직책별 책무 현황 조회 (ledgerOrdersId와 positionsId 지원)
  const fetchPositionResponsibilityData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // API URL 구성
    const params = new URLSearchParams();
    if (selectedPosition?.positionsId) {
      params.append('positionsId', selectedPosition.positionsId.toString());
    }
    if (ledgerOrdersId) {
      params.append('ledgerOrdersId', ledgerOrdersId.toString());
    }

    const url = `/api/position-responsibilities${params.toString() ? `?${params.toString()}` : ''}`;
    
    const data = await callApiWithNotification(() => fetch(url).then(res => res.json()));

    if (data) {
      const mappedRows: PositionResponsibility[] = data.map((item: any) => ({
        id: item.id ?? 0,
        responsibility_id: item.respontibility_id ?? item.id ?? 0,
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
        // ledger_orders 관련 필드 추가
        ledger_orders_id: item.ledger_orders_id ?? null,
        ledger_orders_title: item.ledger_orders_title ?? '',
        ledger_orders_status_cd: item.ledger_orders_status_cd ?? '',
        // approval 관련 필드 추가
        appr_stat_cd: item.appr_stat_cd ?? '',
        // role_resp_status 관련 필드 추가
        role_resp_status_id: item.role_resp_status_id ?? null,
      }));

      setOriginalData(mappedRows);
      
      // 데이터 그룹핑
      const grouped = groupDataByPositionId(mappedRows);
      setGroupedData(grouped);
      
      // 그룹핑된 데이터를 DataGrid용으로 변환
      const gridRows = convertToGridRows(grouped);
      setRows(gridRows);
    }
    
    setLoading(false);
  }, [ledgerOrdersId, selectedPosition, groupDataByPositionId, convertToGridRows, callApiWithNotification]);

  // 초기 데이터 로드 - LedgerOrderSelect 자동 선택 후에만 로드
  useEffect(() => {
    // ledgerOrdersId가 있을 때만 데이터 로드 (자동 선택 후)
    if (ledgerOrdersId) {
      fetchPositionResponsibilityData();
    }
  }, [ledgerOrdersId, fetchPositionResponsibilityData]);

  // 컬럼 정의
  const columns: DataGridColumn<GroupedPositionResponsibilityRow>[] = [
    {
      field: 'appr_stat_cd',
      headerName: '결재상태',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => {
        const code = (value as string) || '';
        const name = getCodeNameFn('APPR_STAT_CD', code);
        // 시각적 강조와 다크 모드 가독성 확보
        const color =
          code === 'APPROVED' ? 'success' :
          code === 'REJECTED' ? 'error' :
          code === 'IN_PROGRESS' ? 'warning' :
          code === 'REQUESTED' ? 'info' : 'default';
        return (
          <Chip
            label={name || code || '-'}
            size="small"
            color={color as any}
            sx={{
              fontWeight: 600,
              // 배경색을 더 연하게 설정하여 텍스트 가독성 향상
              backgroundColor: 
                code === 'APPROVED' ? 'rgba(46, 125, 50, 0.15)' :    // 성공 - 연한 녹색
                code === 'REJECTED' ? 'rgba(211, 47, 47, 0.15)' :     // 에러 - 연한 빨간색
                code === 'IN_PROGRESS' ? 'rgba(237, 108, 2, 0.15)' :  // 경고 - 연한 주황색
                code === 'REQUESTED' ? 'rgba(2, 136, 209, 0.15)' :    // 정보 - 연한 파란색
                'rgba(0, 0, 0, 0.08)',                                // 기본 - 연한 회색
              // 텍스트 색상을 더 진하게 설정
              color: 
                code === 'APPROVED' ? 'rgba(46, 125, 50, 0.9)' :      // 진한 녹색
                code === 'REJECTED' ? 'rgba(211, 47, 47, 0.9)' :      // 진한 빨간색
                code === 'IN_PROGRESS' ? 'rgba(237, 108, 2, 0.9)' :   // 진한 주황색
                code === 'REQUESTED' ? 'rgba(2, 136, 209, 0.9)' :     // 진한 파란색
                'rgba(0, 0, 0, 0.87)',                                // 진한 검정색
              border: 
                code === 'APPROVED' ? '1px solid rgba(46, 125, 50, 0.3)' :
                code === 'REJECTED' ? '1px solid rgba(211, 47, 47, 0.3)' :
                code === 'IN_PROGRESS' ? '1px solid rgba(237, 108, 2, 0.3)' :
                code === 'REQUESTED' ? '1px solid rgba(2, 136, 209, 0.3)' :
                '1px solid rgba(0, 0, 0, 0.2)',
              '& .MuiChip-label': { 
                fontWeight: 600,
                // 텍스트 색상을 동일하게 설정
                color: 
                  code === 'APPROVED' ? 'rgba(46, 125, 50, 0.9)' :
                  code === 'REJECTED' ? 'rgba(211, 47, 47, 0.9)' :
                  code === 'IN_PROGRESS' ? 'rgba(237, 108, 2, 0.9)' :
                  code === 'REQUESTED' ? 'rgba(2, 136, 209, 0.9)' :
                  'rgba(0, 0, 0, 0.87)'
              }
            }}
          />
        );
      },
    },
    {
      field: 'role_resp_status_id',
      headerName: '직책별책무현황ID',
      width: 150,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'ledger_orders_title',
      headerName: '책무번호',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'ledger_orders_status_cd',
      headerName: '진행상태',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => getCodeNameFn('ORDER_STATUS', (value as string) || ''),
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
              allDetails: groupedPosition.details,
              // ledger_orders 관련 필드 추가
              ledger_orders_id: row.ledger_orders_id,
              ledger_orders_title: row.ledger_orders_title,
              ledger_orders_status_cd: row.ledger_orders_status_cd,
              // approval 관련 필드 추가
              appr_stat_cd: row.appr_stat_cd,
              // role_resp_status 관련 필드 추가
              role_resp_status_id: row.role_resp_status_id
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

  // 수정 저장 핸들러
  const handleSave = async () => {
    try {
      // TODO: API 호출로 데이터 저장

      // 목록 새로고침
      await fetchPositionResponsibilityData(); // 현재 필터 조건으로 데이터 다시 로드
    } catch (err) {
      setErrorMessage('데이터 저장에 실패했습니다.');
      setErrorDialogOpen(true);
    }
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

  // 확정 버튼 클릭 핸들러
  const handleConfirmClick = useCallback(() => {
    // 1. LedgerOrderSelect 선택 검증
    if (!selectedLedgerOrder || selectedLedgerOrder === 'ALL') {
      setErrorMessage('원장차수를 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    // 2. "직책확정" 상태 검증 (신규가 아닌 직책확정이어야 함)
    const selectedOption = ledgerOrderOptions.find(option => option.value === selectedLedgerOrder);
    if (!selectedOption) {
      setErrorMessage('선택된 원장차수 정보를 찾을 수 없습니다.');
      setErrorDialogOpen(true);
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
      setErrorMessage('직책확정 상태의 원장차수만 확정 가능합니다.');
      setErrorDialogOpen(true);
      return;
    }

    // 3. DataGrid의 모든 행의 결재상태가 APPROVED인지 검증
    const unapprovedRows = rows.filter(row => row.appr_stat_cd !== 'APPROVED');
    if (unapprovedRows.length > 0) {
      setErrorMessage(`결재가 완료되지 않은 항목이 ${unapprovedRows.length}개 있습니다. 모든 항목의 결재가 승인되어야 확정 가능합니다.`);
      setErrorDialogOpen(true);
      return;
    }

    // 5. 확정 confirm 창 표시
    setConfirmConfirmOpen(true);
  }, [selectedLedgerOrder, ledgerOrderOptions, rows]);

  // LedgerOrderSelect 새로고침 함수
  const refreshLedgerOrderSelect = useCallback(() => {
    setLedgerOrderRefreshTrigger(prev => prev + 1);
  }, [ledgerOrderRefreshTrigger]);

  // 확정 처리 핸들러
  const handleConfirmLedgerOrder = useCallback(async () => {
    if (!selectedLedgerOrder) {
      setConfirmConfirmOpen(false);
      return;
    }

    setLoading(true);
    
    const result = await callApiWithNotification(
      () => positionApi.confirmPositionResponsibility(selectedLedgerOrder),
      'custom'
    );

    if (result) {
      // 1. LedgerOrderSelect 새로고침
      refreshLedgerOrderSelect();
      
      // 2. DataGrid 새로고침
      await fetchPositionResponsibilityData();
    }
    
    setLoading(false);
    setConfirmConfirmOpen(false);
  }, [selectedLedgerOrder, callApiWithNotification, fetchPositionResponsibilityData, refreshLedgerOrderSelect]);

  // 확정취소 버튼 클릭 핸들러
  const handleCancelConfirmClick = useCallback(() => {
    // 1. LedgerOrderSelect 선택 검증
    if (!selectedLedgerOrder || selectedLedgerOrder === 'ALL') {
      setErrorMessage('원장차수를 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    // 2. "직책별책무확정" 상태 검증 (직책확정이 아닌 직책별책무확정이어야 함)
    const selectedOption = ledgerOrderOptions.find(option => option.value === selectedLedgerOrder);
    if (!selectedOption) {
      setErrorMessage('선택된 원장차수 정보를 찾을 수 없습니다.');
      setErrorDialogOpen(true);
      return;
    }

    // label에서 상태 정보 추출하여 "직책별책무확정" 여부 확인
    let statusInfo = '';
    if (selectedOption.label.includes('(') && selectedOption.label.includes(')')) {
      const statusMatch = selectedOption.label.match(/\(([^)]+)\)/);
      if (statusMatch) {
        statusInfo = statusMatch[1];
      }
    }

    if (statusInfo !== '직책별책무확정') {
      setErrorMessage('직책별책무확정 상태의 원장차수만 확정취소 가능합니다.');
      setErrorDialogOpen(true);
      return;
    }

    // 3. 확정취소 confirm 창 표시
    setCancelConfirmOpen(true);
  }, [selectedLedgerOrder, ledgerOrderOptions]);

  // 확정취소 처리 핸들러
  const handleCancelConfirmLedgerOrder = useCallback(async () => {
    if (!selectedLedgerOrder) {
      setCancelConfirmOpen(false);
      return;
    }

    setLoading(true);
    
    const result = await callApiWithNotification(
      () => positionApi.cancelPositionResponsibility(selectedLedgerOrder),
      'custom'
    );

    if (result) {
      // 1. LedgerOrderSelect 새로고침
      refreshLedgerOrderSelect();
      
      // 2. DataGrid 새로고침
      await fetchPositionResponsibilityData();
    }
    
    setLoading(false);
    setCancelConfirmOpen(false);
  }, [selectedLedgerOrder, callApiWithNotification, fetchPositionResponsibilityData, refreshLedgerOrderSelect]);

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
          <LedgerOrderSelect
            value={selectedLedgerOrder}
            onChange={useCallback((value: string, ledgerOrdersId?: number) => {
              setSelectedLedgerOrder(value);
              setLedgerOrdersId(ledgerOrdersId);
            }, [])}
            size='small'
            sx={{ minWidth: 150, maxWidth: 200 }}
            refreshTrigger={ledgerOrderRefreshTrigger}
            onLoadComplete={useCallback((options: Array<{value: string, label: string, ledgerOrdersId: number}>) => {
              setLedgerOrderOptions(options);
            }, [])}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>직책</span>
          <PositionSearchBox
            value={selectedPosition}
            onChange={setSelectedPosition}
            size="small"
            sx={{ minWidth: '200px' }}
          />
          <SearchButton
            onClick={useCallback(() => {
              fetchPositionResponsibilityData();
            }, [fetchPositionResponsibilityData, ledgerOrdersId, selectedPosition?.positionsId])}
            loading={loading}
            disabled={loading}
          />
          <Box sx={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <PermissionButton
              menuCode="LEDGER_MGMT_POSITION_RESPONSIBILITY"
              permission="write"
              variant="contained"
              color="success"
              size="small"
              onClick={handleConfirmClick}
              disabled={loading}
              hideWhenNoPermission={true}
              noPermissionTooltip="확정 권한이 없습니다"
              sx={{
                height: '32px',
                minWidth: '80px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: 1,
              }}
            >
              확정
            </PermissionButton>
            <PermissionButton
              menuCode="LEDGER_MGMT_POSITION_RESPONSIBILITY"
              permission="write"
              variant="contained"
              color="error"
              size="small"
              onClick={handleCancelConfirmClick}
              disabled={loading}
              hideWhenNoPermission={true}
              noPermissionTooltip="확정취소 권한이 없습니다"
              sx={{
                height: '32px',
                minWidth: '80px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: 1,
              }}
            >
              확정취소
            </PermissionButton>
          </Box>
        </Box>

        {/* 액션 버튼 영역 */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            marginBottom: '6px',
            justifyContent: 'flex-end',
            alignItems: 'center',
            height: '32px',
          }}
        >
        <ManagementButtonGroup
            onExcelDownload={handleExcelDownload}
            showExcelDownload={true}
            filename="position_responsibility_status"
          />
          {/* <Button
            variant="contained"
            size="small"
            onClick={handleExcelUpload}
            color="success"
            sx={{
              height: '32px',
              minWidth: '80px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 1,
            }}
          >
            엑셀 업로드
          </Button> */}
          {/* <Button
            variant="contained"
            size="small"
            onClick={handleChangeHistory}
            color="warning"
            sx={{
              height: '32px',
              minWidth: '80px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 1,
            }}
          >
            변경 이력
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
            height={600} 
            error={error}
            selectable
            multiSelect={false}
            selectedRows={selectedIds}
            onRowSelectionChange={(selectedRows: (string | number)[]) => {
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
        // 추가 필드들 전달
        ledgerOrdersId={selectedDetailData?.ledger_orders_id}
        apprStatCd={selectedDetailData?.appr_stat_cd}
        roleRespStatusId={selectedDetailData?.role_resp_status_id}
        onSave={handleSave}
        onChangeMode={setDialogMode}
      />

      {/* 오류 다이얼로그 */}
      <ErrorDialog
        open={errorDialogOpen}
        onClose={handleCloseErrorDialog}
        errorMessage={errorMessage}
      />

      {/* 확정 확인 다이얼로그 */}
      <Confirm
        open={confirmConfirmOpen}
        title="확정 확인"
        message={`${selectedLedgerOrder} 차수의 직책별 책무를 확정하시겠습니까?`}
        confirmText="확정"
        cancelText="취소"
        onConfirm={handleConfirmLedgerOrder}
        onCancel={() => {
          setConfirmConfirmOpen(false);
        }}
      />
      
      {/* 확정취소 확인 다이얼로그 */}
      <Confirm
        open={cancelConfirmOpen}
        title="확정취소 확인"
        message={`${selectedLedgerOrder} 차수의 직책별 책무를 확정취소하시겠습니까?`}
        confirmText="확정취소"
        cancelText="취소"
        onConfirm={handleCancelConfirmLedgerOrder}
        onCancel={() => {
          setCancelConfirmOpen(false);
        }}
      />


    </PageContainer>
  );
};

export default PositionResponsibilityStatusPage;
